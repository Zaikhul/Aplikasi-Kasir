import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/dashboard/common/Dashboard-Layout'
import ProtectedRoute from '@/pages/auth/ProtectedRoute'
import { ordersApi } from '@/lib/api/orders.api'
import { formatCurrency } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import SafeIcon from '@/components/dashboard/common/SafeIcon'

interface InvoiceOrder {
  _id?: string
  orderNumber?: string
  items: Array<{
    productId: string
    productName: string
    price: number
    quantity: number
  }>
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  createdAt: string
  meta?: {
    cashReceived?: number
    changeGiven?: number
  }
}

export default function InvoicePage() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Invoice - Kasir Pintar</title>
      </Head>
      <DashboardLayout headerPlaceholder="Print invoice">
        <InvoiceContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function InvoiceContent() {
  const router = useRouter()
  const { id } = router.query
  const [order, setOrder] = useState<InvoiceOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!router.isReady || typeof id !== 'string') {
      return
    }

    const fetchOrder = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await ordersApi.getById(id)
        setOrder(result)
      } catch (err) {
        console.error('Failed to load order invoice:', err)
        const message = err instanceof Error ? err.message : 'Unable to load invoice data.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id, router.isReady])

  const paymentSummary = useMemo(() => {
    if (!order) {
      return null
    }
    return [
      { label: 'Subtotal', value: formatCurrency(order.subtotal) },
      { label: 'Tax (10%)', value: formatCurrency(order.tax) },
      { label: 'Total', value: formatCurrency(order.total) },
      ...(order.meta?.cashReceived !== undefined
        ? [
            { label: 'Cash received', value: formatCurrency(order.meta.cashReceived) },
            { label: 'Change given', value: formatCurrency(order.meta.changeGiven ?? 0) },
          ]
        : []),
    ]
  }, [order])

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const handleBackToDashboard = () => {
    router.replace('/dashboard-overview')
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Invoice</h1>
        <p className="text-muted-foreground">Print this invoice for your customer records.</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Loading invoice...</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Unable to display invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button type="button" variant="outline" onClick={handleBackToDashboard}>
              <SafeIcon name="ArrowLeft" className="mr-2 h-4 w-4" />
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        order && (
          <Card className="print:border-none print:shadow-none">
            <CardHeader className="flex flex-col gap-1 print:p-4">
              <CardTitle className="text-2xl font-semibold">
                Invoice #{order.orderNumber ?? order._id?.slice(-6)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Date:{' '}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                Payment method: {order.paymentMethod}
              </p>
            </CardHeader>
            <CardContent className="space-y-6 print:p-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Unit price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items?.map((item) => (
                      <TableRow key={`${item.productId}-${item.productName}`}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
                {paymentSummary?.map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 print:hidden">
                <Button type="button" onClick={handlePrint} className="gap-2">
                  <SafeIcon name="Printer" className="mr-2 h-4 w-4" />
                  Print invoice
                </Button>
                <Button type="button" variant="outline" onClick={handleBackToDashboard}>
                  <SafeIcon name="ArrowLeft" className="mr-2 h-4 w-4" />
                  Back to dashboard
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center print:mt-8">
                Terima kasih telah berbelanja dan sampai jumpa kembali.
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}

