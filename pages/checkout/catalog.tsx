import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/dashboard/common/Dashboard-Layout'
import ProtectedRoute from '@/pages/auth/ProtectedRoute'
import {
  calculateCatalogTotals,
  clearCatalogSelection,
  loadCatalogSelection,
  type CatalogSelectionItem,
} from '@/lib/catalog-selection'
import { ordersApi } from '@/lib/api/orders.api'
import { formatCurrency } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'

const TAX_RATE = 0.1
type PaymentMethod = 'cash' | 'card' | 'digital'

const paymentOptions: Array<{
  value: PaymentMethod
  label: string
  icon: string
}> = [
  { value: 'cash', label: 'Cash', icon: 'Wallet' },
  { value: 'card', label: 'Card', icon: 'CreditCard' },
  { value: 'digital', label: 'Digital', icon: 'QrCode' },
]

export default function CatalogCheckoutPage() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Catalog Checkout - Kasir Pintar</title>
      </Head>
      <DashboardLayout headerPlaceholder="Review order items">
        <CheckoutContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function CheckoutContent() {
  const router = useRouter()
  const [items, setItems] = useState<CatalogSelectionItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [cashGiven, setCashGiven] = useState('')

  useEffect(() => {
    const selection = loadCatalogSelection()
    setItems(selection)
  }, [])

  useEffect(() => {
    if (paymentMethod !== 'cash') {
      setCashGiven('')
    }
  }, [paymentMethod])

  const totals = useMemo(() => calculateCatalogTotals(items), [items])
  const tax = totals.subtotal * TAX_RATE
  const grandTotal = totals.subtotal + tax
  const cashAmount = useMemo(() => {
    const parsed = Number.parseFloat(cashGiven)
    return Number.isFinite(parsed) ? parsed : 0
  }, [cashGiven])
  const changeDue = useMemo(() => Math.max(cashAmount - grandTotal, 0), [cashAmount, grandTotal])
  const isCashValid =
    paymentMethod !== 'cash' || (cashGiven.trim().length > 0 && cashAmount >= grandTotal)

  const handleBackToCatalog = () => {
    router.push('/catalog')
  }

  const handleProcessOrder = async () => {
    if (items.length === 0 || isProcessing || !isCashValid) {
      return
    }
    setIsProcessing(true)
    try {
      const order = await ordersApi.create({
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
        subtotal: totals.subtotal,
        tax,
        total: grandTotal,
        paymentMethod,
        ...(paymentMethod === 'cash'
          ? {
              cashReceived: cashAmount,
              changeGiven: changeDue,
            }
          : {}),
        notes: `Catalog checkout order (${paymentMethod})`,
      })
      clearCatalogSelection()
      const createdOrderId = order?._id ?? order?.id
      if (createdOrderId) {
        router.replace(`/checkout/invoice/${createdOrderId}`)
      } else {
        router.replace('/report-analytics')
      }
    } catch (error) {
      console.error('Failed to process catalog checkout:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to process order: ${message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground">
          Review the selected products before confirming your order.
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No items selected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Return to the catalog to choose the products you want to purchase.
            </p>
            <Button type="button" onClick={handleBackToCatalog}>
              <SafeIcon name="ArrowLeft" className="mr-2 h-4 w-4" />
              Back to catalog
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card>
            <CardHeader className="flex flex-col gap-1">
              <CardTitle className="text-xl font-semibold">
                Selected items ({items.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                The checkout total automatically reflects each item&apos;s price and quantity.
              </p>
            </CardHeader>
            <CardContent className="p-0">
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
                  {items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

           <Card className="h-fit">
             <CardHeader>
               <CardTitle className="text-xl font-semibold">Payment summary</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <p className="text-sm font-medium text-muted-foreground">Payment method</p>
                 <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                   {paymentOptions.map((option) => (
                     <Button
                       key={option.value}
                       type="button"
                       variant={paymentMethod === option.value ? 'default' : 'outline'}
                       className="gap-2"
                       onClick={() => setPaymentMethod(option.value)}
                     >
                       <SafeIcon name={option.icon} className="h-4 w-4" />
                       {option.label}
                     </Button>
                   ))}
                 </div>

                 {paymentMethod === 'cash' && (
                   <div className="space-y-2">
                     <label htmlFor="cashGiven" className="text-xs font-medium text-muted-foreground">
                       Cash received
                     </label>
                     <Input
                       id="cashGiven"
                       type="number"
                       min="0"
                       inputMode="decimal"
                       placeholder={formatCurrency(grandTotal)}
                       value={cashGiven}
                       onChange={(event) => setCashGiven(event.target.value)}
                     />
                     {cashGiven && cashAmount < grandTotal && (
                       <p className="text-xs text-destructive">
                         Cash is not enough. Missing {formatCurrency(Math.max(grandTotal - cashAmount, 0))}
                       </p>
                     )}
                     {cashGiven && cashAmount >= grandTotal && (
                       <p className="text-xs text-muted-foreground">
                         Change to return:{' '}
                         <span className="font-semibold">{formatCurrency(changeDue)}</span>
                       </p>
                     )}
                   </div>
                 )}
               </div>

               <div className="space-y-2 text-sm">
                 <div className="flex items-center justify-between">
                   <span className="text-muted-foreground">Items</span>
                   <span className="font-medium">{totals.totalQuantity}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-muted-foreground">Subtotal</span>
                   <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-muted-foreground">Tax (10%)</span>
                   <span className="font-semibold">{formatCurrency(tax)}</span>
                 </div>
                 {paymentMethod === 'cash' && (
                   <div className="flex items-center justify-between">
                     <span className="text-muted-foreground">Change</span>
                     <span className="font-semibold">{formatCurrency(changeDue)}</span>
                   </div>
                 )}
               </div>
               <Separator />
               <div className="flex items-center justify-between text-lg font-semibold">
                 <span>Total payable</span>
                 <span>{formatCurrency(grandTotal)}</span>
               </div>
               <div className="grid gap-3">
                 <Button type="button" variant="outline" onClick={handleBackToCatalog}>
                   <SafeIcon name="ArrowLeft" className="mr-2 h-4 w-4" />
                   Modify selection
                 </Button>
                 <Button
                   type="button"
                   onClick={handleProcessOrder}
                   disabled={isProcessing || !isCashValid}
                 >
                   {isProcessing ? (
                     <>
                       <SafeIcon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                       Processing...
                     </>
                   ) : (
                     <>
                       <SafeIcon name="CreditCard" className="mr-2 h-4 w-4" />
                       Confirm and submit order
                     </>
                   )}
                 </Button>
               </div>
             </CardContent>
           </Card>
        </div>
      )}
    </div>
  )
}

