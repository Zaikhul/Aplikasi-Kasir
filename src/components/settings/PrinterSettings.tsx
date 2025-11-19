import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

// Printer configuration type
interface PrinterConfig {
  id: string
  name: string
  type: 'bluetooth' | 'usb'
  connected: boolean
  device?: any
  lastConnected?: string
}

export default function PrinterSettings() {
  const [printers, setPrinters] = useState<PrinterConfig[]>([])
  const [activePrinter, setActivePrinter] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testPrinting, setTestPrinting] = useState(false)

  // Load saved printer configuration on mount
  useEffect(() => {
    loadPrinterConfig()
  }, [])

  const loadPrinterConfig = () => {
    try {
      const saved = localStorage.getItem('printer_config')
      if (saved) {
        const config = JSON.parse(saved)
        setPrinters(config.printers || [])
        setActivePrinter(config.activePrinter || null)
      }
    } catch (err) {
      console.error('Failed to load printer config:', err)
    }
  }

  const savePrinterConfig = (newPrinters: PrinterConfig[], newActive: string | null) => {
    try {
      localStorage.setItem('printer_config', JSON.stringify({
        printers: newPrinters.map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          connected: false, // Don't persist connection state
          lastConnected: p.lastConnected
        })),
        activePrinter: newActive
      }))
    } catch (err) {
      console.error('Failed to save printer config:', err)
    }
  }

  // Type assertion for Web Bluetooth API
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

  // Check browser support with type guards
  const checkSupport = () => {
    const nav = navigator as NavigatorWithBluetooth
    const bluetooth = 'bluetooth' in navigator && nav.bluetooth !== undefined
    const usb = 'usb' in navigator && (navigator as any).usb !== undefined
    return { bluetooth, usb }
  }

  const support = checkSupport()

  // Connect to Bluetooth printer
  const connectBluetooth = async () => {
    const nav = navigator as NavigatorWithBluetooth
    if (!support.bluetooth || !nav.bluetooth) {
      setError('Bluetooth is not supported in your browser. Please use Chrome, Edge, or Opera.')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      // Request Bluetooth device
      const device = await nav.bluetooth!.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Printer service
        ],
        optionalServices: ['battery_service']
      })

      const server = await device.gatt?.connect()
      
      if (!server) {
        throw new Error('Failed to connect to device')
      }

      // Add printer to list
      const newPrinter: PrinterConfig = {
        id: device.id,
        name: device.name || 'Bluetooth Printer',
        type: 'bluetooth',
        connected: true,
        device: device,
        lastConnected: new Date().toISOString()
      }

      const updatedPrinters = [...printers.filter(p => p.id !== device.id), newPrinter]
      setPrinters(updatedPrinters)
      setActivePrinter(device.id)
      savePrinterConfig(updatedPrinters, device.id)

      // Listen for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        setPrinters(prev => prev.map(p => 
          p.id === device.id ? { ...p, connected: false } : p
        ))
      })

    } catch (err: any) {
      console.error('Bluetooth connection error:', err)
      setError(err.message || 'Failed to connect to Bluetooth printer')
    } finally {
      setConnecting(false)
    }
  }

  // Connect to USB printer
  const connectUSB = async () => {
    if (!support.usb) {
      setError('USB is not supported in your browser. Please use Chrome, Edge, or Opera.')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      // Request USB device
      const device = await (navigator as any).usb.requestDevice({
        filters: [
          { classCode: 7 } // Printer class
        ]
      })

      await device.open()
      await device.selectConfiguration(1)
      await device.claimInterface(0)

      // Add printer to list
      const newPrinter: PrinterConfig = {
        id: device.serialNumber || `usb-${Date.now()}`,
        name: device.productName || 'USB Printer',
        type: 'usb',
        connected: true,
        device: device,
        lastConnected: new Date().toISOString()
      }

      const updatedPrinters = [...printers.filter(p => p.id !== newPrinter.id), newPrinter]
      setPrinters(updatedPrinters)
      setActivePrinter(newPrinter.id)
      savePrinterConfig(updatedPrinters, newPrinter.id)

    } catch (err: any) {
      console.error('USB connection error:', err)
      setError(err.message || 'Failed to connect to USB printer')
    } finally {
      setConnecting(false)
    }
  }

  // Disconnect printer
  const disconnectPrinter = async (printerId: string) => {
    const printer = printers.find(p => p.id === printerId)
    if (!printer) return

    try {
      if (printer.type === 'bluetooth' && printer.device?.gatt?.connected) {
        await printer.device.gatt.disconnect()
      } else if (printer.type === 'usb' && printer.device) {
        await printer.device.close()
      }

      setPrinters(prev => prev.map(p => 
        p.id === printerId ? { ...p, connected: false } : p
      ))
    } catch (err) {
      console.error('Disconnect error:', err)
    }
  }

  // Remove printer from list
  const removePrinter = (printerId: string) => {
    const updatedPrinters = printers.filter(p => p.id !== printerId)
    const newActive = activePrinter === printerId ? null : activePrinter
    
    setPrinters(updatedPrinters)
    setActivePrinter(newActive)
    savePrinterConfig(updatedPrinters, newActive)
  }

  // Set active printer
  const setActivePreference = (printerId: string) => {
    setActivePrinter(printerId)
    savePrinterConfig(printers, printerId)
  }

  // Test print function
  const testPrint = async () => {
    const printer = printers.find(p => p.id === activePrinter)
    if (!printer) {
      setError('No active printer selected')
      return
    }

    setTestPrinting(true)
    setError(null)

    try {
      // ESC/POS commands for test receipt
      const commands = [
        0x1B, 0x40, // Initialize
        0x1B, 0x61, 0x01, // Center align
        0x1D, 0x21, 0x11, // Double size
        ...textToBytes('TEST PRINT\n'),
        0x1D, 0x21, 0x00, // Normal size
        0x1B, 0x61, 0x00, // Left align
        ...textToBytes('\nPrinter: ' + printer.name + '\n'),
        ...textToBytes('Type: ' + printer.type.toUpperCase() + '\n'),
        ...textToBytes('Time: ' + new Date().toLocaleString() + '\n'),
        0x1B, 0x61, 0x01, // Center align
        ...textToBytes('\n--- SUCCESS ---\n'),
        0x1B, 0x64, 0x05, // Feed 5 lines
        0x1D, 0x56, 0x00, // Cut paper
      ]

      const data = new Uint8Array(commands)

      if (printer.type === 'bluetooth') {
        await printViaBluetooth(printer.device, data)
      } else if (printer.type === 'usb') {
        await printViaUSB(printer.device, data)
      }

      alert('Test print sent successfully! Check your printer.')
    } catch (err: any) {
      console.error('Test print error:', err)
      setError('Failed to send test print: ' + err.message)
    } finally {
      setTestPrinting(false)
    }
  }

  // Helper function to convert text to bytes
  const textToBytes = (text: string): number[] => {
    return Array.from(new TextEncoder().encode(text))
  }

  // Print via Bluetooth
  const printViaBluetooth = async (device: any, data: Uint8Array) => {
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
      await new Promise(resolve => setTimeout(resolve, 50)) // Small delay between chunks
    }
  }

  // Print via USB
  const printViaUSB = async (device: any, data: Uint8Array) => {
    if (!device.opened) {
      await device.open()
      await device.selectConfiguration(1)
      await device.claimInterface(0)
    }
    
    await device.transferOut(1, data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Printer Configuration
        </CardTitle>
        <CardDescription>
          Connect your thermal receipt printer via Bluetooth or USB for direct printing
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Browser support warning */}
        {(!support.bluetooth || !support.usb) && (
          <Alert>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <AlertDescription>
              {!support.bluetooth && 'Bluetooth printing requires Chrome, Edge, or Opera. '}
              {!support.usb && 'USB printing requires Chrome, Edge, or Opera. '}
              Please use a supported browser for printer connectivity.
            </AlertDescription>
          </Alert>
        )}

        {/* Error display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Connect buttons */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Add New Printer</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={connectBluetooth}
              disabled={connecting || !support.bluetooth}
              variant="outline"
              className="flex-1 min-w-[200px]"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
              </svg>
              {connecting ? 'Connecting...' : 'Connect Bluetooth'}
            </Button>
            
            <Button
              onClick={connectUSB}
              disabled={connecting || !support.usb}
              variant="outline"
              className="flex-1 min-w-[200px]"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2-1.21 0-2.2.99-2.2 2.2 0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95 0 1.22.99 2.2 2.2 2.2 1.21 0 2.2-.98 2.2-2.2 0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2v-2h1V7h-4z"/>
              </svg>
              {connecting ? 'Connecting...' : 'Connect USB'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Click to search and connect to nearby printers
          </p>
        </div>

        <Separator />

        {/* Connected printers list */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Configured Printers</h3>
          
          {printers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <p className="text-sm">No printers configured</p>
              <p className="text-xs mt-1">Connect a printer to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {printers.map((printer) => (
                <div
                  key={printer.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    activePrinter === printer.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{printer.name}</h4>
                        <Badge variant={printer.connected ? 'default' : 'secondary'}>
                          {printer.connected ? 'Connected' : 'Saved'}
                        </Badge>
                        {activePrinter === printer.id && (
                          <Badge variant="outline" className="bg-primary/10">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="capitalize">{printer.type}</span>
                          {printer.type === 'bluetooth' && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
                            </svg>
                          )}
                          {printer.type === 'usb' && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2-1.21 0-2.2.99-2.2 2.2 0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95 0 1.22.99 2.2 2.2 2.2 1.21 0 2.2-.98 2.2-2.2 0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2v-2h1V7h-4z"/>
                            </svg>
                          )}
                        </div>
                        {printer.lastConnected && (
                          <div>Last used: {new Date(printer.lastConnected).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {activePrinter !== printer.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActivePreference(printer.id)}
                        >
                          Set Active
                        </Button>
                      )}
                      {printer.connected && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => disconnectPrinter(printer.id)}
                        >
                          Disconnect
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removePrinter(printer.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test print button */}
        {activePrinter && (
          <>
            <Separator />
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Test Printer</h4>
                <p className="text-xs text-muted-foreground">
                  Send a test receipt to verify connection
                </p>
              </div>
              <Button
                onClick={testPrint}
                disabled={testPrinting}
                variant="outline"
              >
                {testPrinting ? 'Printing...' : 'Print Test'}
              </Button>
            </div>
          </>
        )}

        {/* Info */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-blue-900 dark:text-blue-100 space-y-1">
              <p className="font-medium">Printer Tips:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-1">
                <li>Ensure your printer is powered on and in pairing mode</li>
                <li>For Bluetooth: Enable Bluetooth on your device</li>
                <li>For USB: Allow USB access when prompted</li>
                <li>Most thermal printers use ESC/POS protocol (80mm width)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}