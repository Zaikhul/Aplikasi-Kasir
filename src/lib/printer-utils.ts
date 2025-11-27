/**
 * Printer Utility Module
 * Handles direct printing to Bluetooth and USB thermal printers
 * Uses ESC/POS commands for receipt formatting
 */

export interface PrinterConfig {
  id: string
  name: string
  type: 'bluetooth' | 'usb'
  connected: boolean
  device?: any
  lastConnected?: string
}

export interface InvoiceData {
  orderNumber: string
  date: string
  userName?: string
  paymentMethod: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  cashReceived?: number
  changeGiven?: number
}

/**
 * ESC/POS Commands
 */
const ESC = 0x1B
const GS = 0x1D

const Commands = {
  INIT: [ESC, 0x40], // Initialize printer
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],
  TEXT_NORMAL: [GS, 0x21, 0x00],
  TEXT_DOUBLE: [GS, 0x21, 0x11], // Double width and height
  TEXT_DOUBLE_HEIGHT: [GS, 0x21, 0x01],
  TEXT_DOUBLE_WIDTH: [GS, 0x21, 0x10],
  TEXT_BOLD_ON: [ESC, 0x45, 0x01],
  TEXT_BOLD_OFF: [ESC, 0x45, 0x00],
  LINE_FEED: [0x0A],
  CUT_PAPER: [GS, 0x56, 0x00],
  FEED_LINES: (lines: number) => [ESC, 0x64, lines],
}

/**
 * Get active printer configuration
 */
export function getActivePrinter(): PrinterConfig | null {
  try {
    const config = localStorage.getItem('printer_config')
    if (!config) return null

    const parsed = JSON.parse(config)
    const activePrinter = parsed.printers?.find(
      (p: PrinterConfig) => p.id === parsed.activePrinter
    )

    return activePrinter || null
  } catch (err) {
    console.error('Failed to get active printer:', err)
    return null
  }
}

/**
 * Convert text to bytes
 */
function textToBytes(text: string): number[] {
  return Array.from(new TextEncoder().encode(text))
}

/**
 * Create a line of text with padding
 */
function createLine(left: string, right: string, width: number = 32): number[] {
  const padding = width - left.length - right.length
  const line = left + ' '.repeat(Math.max(0, padding)) + right
  return textToBytes(line + '\n')
}

/**
 * Create separator line
 */
function createSeparator(char: string = '-', width: number = 32): number[] {
  return textToBytes(char.repeat(width) + '\n')
}

/**
 * Generate ESC/POS commands for invoice
 */
export function generateInvoiceCommands(invoice: InvoiceData): Uint8Array {
  const commands: number[] = []

  // Initialize
  commands.push(...Commands.INIT)

  // Header - centered, double size
  commands.push(...Commands.ALIGN_CENTER)
  commands.push(...Commands.TEXT_DOUBLE)
  commands.push(...textToBytes('KASIR PINTAR\n'))
  commands.push(...Commands.TEXT_NORMAL)
  commands.push(...textToBytes('Point of Sale System\n'))

  // User name - centered
  if (invoice.userName) {
    commands.push(...textToBytes(`${invoice.userName}\n`))
  }
  commands.push(...createSeparator('='))

  // Order info - left aligned
  commands.push(...Commands.ALIGN_LEFT)
  commands.push(...textToBytes(`Invoice: ${invoice.orderNumber}\n`))
  commands.push(...textToBytes(`Date: ${invoice.date}\n`))
  commands.push(...textToBytes(`Payment: ${invoice.paymentMethod.toUpperCase()}\n`))
  commands.push(...createSeparator('-'))

  // Items header
  commands.push(...Commands.TEXT_BOLD_ON)
  commands.push(...textToBytes('Item              Qty    Amount\n'))
  commands.push(...Commands.TEXT_BOLD_OFF)
  commands.push(...createSeparator('-'))

  // Items
  invoice.items.forEach((item) => {
    // Item name (truncate if too long)
    const itemName = item.name.length > 18
      ? item.name.substring(0, 15) + '...'
      : item.name
    commands.push(...textToBytes(itemName + '\n'))

    // Price line with quantity and total
    const priceInfo = `Rp ${item.price.toLocaleString('id-ID')}`
    const qtyStr = `x${item.quantity}`
    const totalStr = `Rp ${item.total.toLocaleString('id-ID')}`

    const priceLine = `  ${priceInfo}`.padEnd(18) + qtyStr.padEnd(7) + totalStr
    commands.push(...textToBytes(priceLine + '\n'))
  })

  commands.push(...createSeparator('-'))

  // Summary
  commands.push(...createLine('Subtotal:', `Rp ${invoice.subtotal.toLocaleString('id-ID')}`))
  commands.push(...createLine('Tax (10%):', `Rp ${invoice.tax.toLocaleString('id-ID')}`))
  commands.push(...createSeparator('='))

  // Total - emphasized
  commands.push(...Commands.TEXT_DOUBLE_HEIGHT)
  commands.push(...Commands.TEXT_BOLD_ON)
  commands.push(...createLine('TOTAL:', `Rp ${invoice.total.toLocaleString('id-ID')}`))
  commands.push(...Commands.TEXT_BOLD_OFF)
  commands.push(...Commands.TEXT_NORMAL)
  commands.push(...createSeparator('='))

  // Cash payment details
  if (invoice.cashReceived !== undefined) {
    commands.push(...createLine('Cash:', `Rp ${invoice.cashReceived.toLocaleString('id-ID')}`))
    commands.push(...createLine('Change:', `Rp ${(invoice.changeGiven || 0).toLocaleString('id-ID')}`))
    commands.push(...createSeparator('-'))
  }

  // Footer - centered
  commands.push(...Commands.ALIGN_CENTER)
  commands.push(...Commands.LINE_FEED)
  commands.push(...textToBytes('Thank you for your purchase!\n'))
  commands.push(...textToBytes('Please come again\n'))
  commands.push(...Commands.LINE_FEED)
  commands.push(...textToBytes('Powered by Kasir Pintar POS\n'))

  // Feed and cut
  commands.push(...Commands.FEED_LINES(3))
  commands.push(...Commands.CUT_PAPER)

  return new Uint8Array(commands)
}

/**
 * Print via Bluetooth
 */
async function printViaBluetooth(device: any, data: Uint8Array): Promise<void> {
  // Reconnect if needed
  if (!device.gatt?.connected) {
    await device.gatt.connect()
  }

  // Get printer service and characteristic
  const service = await device.gatt.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
  const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb')

  // Send data in chunks (Bluetooth LE has 20 byte limit per write)
  const chunkSize = 20
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, Math.min(i + chunkSize, data.length))
    await characteristic.writeValue(chunk)
    // Small delay between chunks to prevent buffer overflow
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

/**
 * Print via USB
 */
async function printViaUSB(device: any, data: Uint8Array): Promise<void> {
  // Open device if not already open
  if (!device.opened) {
    await device.open()
    await device.selectConfiguration(1)
    await device.claimInterface(0)
  }

  // Send data to printer (endpoint 1 is typically the output endpoint)
  await device.transferOut(1, data)
}

/**
 * Print invoice to configured printer
 */
export async function printInvoice(invoice: InvoiceData): Promise<void> {
  const printer = getActivePrinter()

  if (!printer) {
    throw new Error('No printer configured. Please configure a printer in your profile settings.')
  }

  // Generate ESC/POS commands
  const commands = generateInvoiceCommands(invoice)

  // Print based on printer type
  try {
    if (printer.type === 'bluetooth') {
      // For Bluetooth, we need to request the device again
      if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
        throw new Error('Bluetooth not available')
      }

      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }]
      })
      await printViaBluetooth(device, commands)
    } else if (printer.type === 'usb') {
      // For USB, request device access
      if (typeof navigator === 'undefined' || !(navigator as any).usb) {
        throw new Error('USB not available')
      }

      const devices = await (navigator as any).usb.getDevices()
      const device = devices.find((d: any) =>
        d.serialNumber === printer.id || d.productName === printer.name
      )

      if (!device) {
        throw new Error('USB printer not found. Please reconnect the printer.')
      }

      await printViaUSB(device, commands)
    }

    // Update last connected time
    const config = JSON.parse(localStorage.getItem('printer_config') || '{}')
    const updatedPrinters = config.printers?.map((p: PrinterConfig) =>
      p.id === printer.id ? { ...p, lastConnected: new Date().toISOString() } : p
    )
    localStorage.setItem('printer_config', JSON.stringify({
      ...config,
      printers: updatedPrinters
    }))

  } catch (err: any) {
    console.error('Print error:', err)
    throw new Error(`Failed to print: ${err.message}`)
  }
}

/**
 * Check if printer is available
 */
export function isPrinterAvailable(): boolean {
  const printer = getActivePrinter()
  return printer !== null
}

/**
 * Get printer info
 */
export function getPrinterInfo(): { name: string; type: string } | null {
  const printer = getActivePrinter()
  if (!printer) return null

  return {
    name: printer.name,
    type: printer.type
  }
}