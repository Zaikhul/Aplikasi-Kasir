// Printer configuration type
interface PrinterConfig {
  id: string
  name: string
  type: 'bluetooth' | 'usb'
  connected: boolean
  device?: any
  lastConnected?: string
}

// Type definitions for Web Bluetooth API
interface NavigatorWithBluetooth extends Navigator {
  bluetooth?: Bluetooth
}

interface Bluetooth {
  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>
}

interface RequestDeviceOptions {
  filters: BluetoothLEScanFilter[]
  optionalServices?: BluetoothServiceUUID[]
}

interface BluetoothLEScanFilter {
  services?: BluetoothServiceUUID[]
}

interface BluetoothDevice extends EventTarget {
  id: string
  name?: string
  gatt?: BluetoothRemoteGATTServer
}

interface BluetoothRemoteGATTServer {
  connect(): Promise<BluetoothRemoteGATTServer>
  connected: boolean
  disconnect(): void
  getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothRemoteGATTCharacteristic>
}

interface BluetoothRemoteGATTCharacteristic {
  writeValue(value: BufferSource): Promise<void>
}

type BluetoothServiceUUID = number | string
type BluetoothCharacteristicUUID = number | string

// Invoice data type
export interface InvoiceData {
  orderNumber?: string
  orderId?: string
  items: Array<{
    productName: string
    quantity: number
    price: number
  }>
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  createdAt: string
  cashReceived?: number
  changeGiven?: number
}

/**
 * Load printer configuration from localStorage
 */
function loadPrinterConfig(): { printers: PrinterConfig[]; activePrinter: string | null } {
  try {
    const saved = localStorage.getItem('printer_config')
    if (saved) {
      const config = JSON.parse(saved)
      return {
        printers: config.printers || [],
        activePrinter: config.activePrinter || null,
      }
    }
  } catch (err) {
    console.error('Failed to load printer config:', err)
  }
  return { printers: [], activePrinter: null }
}

/**
 * Get the active printer device
 */
async function getActivePrinter(): Promise<PrinterConfig | null> {
  const { printers, activePrinter } = loadPrinterConfig()
  
  if (!activePrinter) {
    return null
  }

  const printer = printers.find((p) => p.id === activePrinter)
  if (!printer) {
    return null
  }

  // For Bluetooth printers, we need to check if device is still accessible
  // For USB printers, we can return the saved config
  return printer
}

/**
 * Convert text to bytes array
 */
function textToBytes(text: string): number[] {
  return Array.from(new TextEncoder().encode(text))
}

/**
 * Generate ESC/POS commands for invoice
 */
function generateInvoiceCommands(invoice: InvoiceData): number[] {
  const commands: number[] = []

  // Initialize printer
  commands.push(0x1b, 0x40) // ESC @

  // Header - Center aligned, Double size
  commands.push(0x1b, 0x61, 0x01) // Center align
  commands.push(0x1d, 0x21, 0x11) // Double width and height
  commands.push(...textToBytes('INVOICE\n'))
  commands.push(0x1d, 0x21, 0x00) // Normal size
  commands.push(0x1b, 0x61, 0x00) // Left align

  // Order number
  commands.push(...textToBytes('Order: '))
  commands.push(0x1d, 0x21, 0x01) // Double height
  commands.push(...textToBytes(`${invoice.orderNumber || invoice.orderId?.slice(-8) || 'N/A'}\n`))
  commands.push(0x1d, 0x21, 0x00) // Normal size

  // Date
  const date = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('id-ID')
  commands.push(...textToBytes(`Date: ${date}\n`))
  commands.push(...textToBytes('--------------------------------\n'))

  // Items header
  commands.push(...textToBytes('\n'))
  commands.push(0x1b, 0x45, 0x01) // Bold on
  commands.push(...textToBytes('Items:\n'))
  commands.push(0x1b, 0x45, 0x00) // Bold off
  commands.push(...textToBytes('--------------------------------\n'))

  // Items
  for (const item of invoice.items) {
    const itemName = item.productName.substring(0, 20) // Limit to 20 chars
    const qty = item.quantity.toString()
    const price = item.price.toLocaleString('id-ID')
    const subtotal = (item.price * item.quantity).toLocaleString('id-ID')

    // Item name (left aligned)
    commands.push(...textToBytes(`${itemName}\n`))
    // Quantity x Price = Subtotal (right aligned)
    commands.push(0x1b, 0x61, 0x02) // Right align
    commands.push(...textToBytes(`${qty} x ${price} = ${subtotal}\n`))
    commands.push(0x1b, 0x61, 0x00) // Left align
  }

  commands.push(...textToBytes('--------------------------------\n'))

  // Totals
  commands.push(0x1b, 0x61, 0x02) // Right align
  commands.push(...textToBytes(`Subtotal: ${invoice.subtotal.toLocaleString('id-ID')}\n`))
  // # Tax display deactivated
  // commands.push(...textToBytes(`Tax (10%): ${invoice.tax.toLocaleString('id-ID')}\n`))
  commands.push(0x1b, 0x45, 0x01) // Bold on
  commands.push(0x1d, 0x21, 0x01) // Double height
  commands.push(...textToBytes(`TOTAL: ${invoice.total.toLocaleString('id-ID')}\n`))
  commands.push(0x1d, 0x21, 0x00) // Normal size
  commands.push(0x1b, 0x45, 0x00) // Bold off
  commands.push(0x1b, 0x61, 0x00) // Left align

  // Payment method
  commands.push(...textToBytes('--------------------------------\n'))
  commands.push(...textToBytes(`Payment: ${invoice.paymentMethod.toUpperCase()}\n`))

  // Cash payment details
  if (invoice.cashReceived !== undefined) {
    commands.push(...textToBytes(`Cash: ${invoice.cashReceived.toLocaleString('id-ID')}\n`))
    if (invoice.changeGiven !== undefined && invoice.changeGiven > 0) {
      commands.push(...textToBytes(`Change: ${invoice.changeGiven.toLocaleString('id-ID')}\n`))
    }
  }

  // Footer
  commands.push(...textToBytes('--------------------------------\n'))
  commands.push(0x1b, 0x61, 0x01) // Center align
  commands.push(...textToBytes('\n'))
  commands.push(...textToBytes('Terima kasih\n'))
  commands.push(...textToBytes('Sampai jumpa kembali\n'))
  commands.push(...textToBytes('\n'))

  // Feed and cut
  commands.push(0x1b, 0x64, 0x05) // Feed 5 lines
  commands.push(0x1d, 0x56, 0x00) // Cut paper

  return commands
}

/**
 * Print via Bluetooth
 */
async function printViaBluetooth(printer: PrinterConfig, data: Uint8Array): Promise<void> {
  const nav = navigator as NavigatorWithBluetooth
  if (!nav.bluetooth) {
    throw new Error('Bluetooth is not available')
  }

  let device: BluetoothDevice | null = null

  // Check if device object is available and connected
  if (printer.device?.gatt?.connected) {
    device = printer.device
  } else {
    // Try to reconnect - request device again (browser will show device picker)
    try {
      // Request device using service filter - user will need to select the device
      device = await nav.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Printer service
        ],
        optionalServices: ['battery_service'],
      })
      await device.gatt?.connect()
    } catch (err: any) {
      if (err.name === 'NotFoundError' || err.name === 'SecurityError') {
        throw new Error('Bluetooth printer connection cancelled or not found. Please reconnect from settings.')
      }
      throw new Error(`Failed to connect to Bluetooth device: ${err.message}`)
    }
  }

  if (!device) {
    throw new Error('Failed to get Bluetooth device')
  }

  if (!device.gatt) {
    throw new Error('Bluetooth device GATT server is not available')
  }

  if (!device.gatt.connected) {
    await device.gatt.connect()
  }

  const service = await device.gatt.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
  const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb')

  // Send data in chunks (max 20 bytes for Bluetooth)
  const chunkSize = 20
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    await characteristic.writeValue(chunk)
    await new Promise((resolve) => setTimeout(resolve, 50)) // Small delay between chunks
  }
}

/**
 * Print via USB
 */
async function printViaUSB(device: any, data: Uint8Array): Promise<void> {
  const nav = navigator as any
  if (!nav.usb) {
    throw new Error('USB is not available')
  }

  // If device is not opened, try to open it
  if (!device.opened) {
    try {
      await device.open()
      await device.selectConfiguration(1)
      await device.claimInterface(0)
    } catch (err: any) {
      throw new Error(`Failed to open USB device: ${err.message}`)
    }
  }

  await device.transferOut(1, data)
}

/**
 * Print invoice using configured printer
 */
export async function printInvoice(invoice: InvoiceData): Promise<void> {
  const printer = await getActivePrinter()

  if (!printer) {
    // Fallback to browser print dialog
    console.warn('No printer configured, falling back to browser print')
    if (typeof window !== 'undefined') {
      window.print()
      return
    }
    throw new Error('No printer configured and browser print is not available')
  }

  // Generate ESC/POS commands
  const commands = generateInvoiceCommands(invoice)
  const data = new Uint8Array(commands)

  try {
    if (printer.type === 'bluetooth') {
      await printViaBluetooth(printer, data)
    } else if (printer.type === 'usb') {
      if (!printer.device) {
        throw new Error('USB device not available. Please reconnect the printer from settings.')
      }
      await printViaUSB(printer.device, data)
    } else {
      throw new Error(`Unsupported printer type: ${printer.type}`)
    }
  } catch (error: any) {
    console.error('Print error:', error)
    // If direct printing fails, fallback to browser print
    console.warn('Direct printing failed, falling back to browser print:', error.message)
    if (typeof window !== 'undefined') {
      window.print()
      return
    }
    throw error
  }
}

/**
 * Check if a printer is configured and available
 */
export function isPrinterConfigured(): boolean {
  const { printers, activePrinter } = loadPrinterConfig()
  return printers.length > 0 && activePrinter !== null
}

/**
 * Get active printer name
 */
export function getActivePrinterName(): string | null {
  const { printers, activePrinter } = loadPrinterConfig()
  const printer = printers.find((p) => p.id === activePrinter)
  return printer?.name || null
}

