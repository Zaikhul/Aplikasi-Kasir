'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import type { CatalogSelectionItem } from '@/lib/catalog-selection'
import { formatCurrency } from '@/lib/currency'

type CatalogSummaryProps = Readonly<{
  items: CatalogSelectionItem[]
  subtotal: number
  totalQuantity: number
  onClear: () => void
  onCheckout: () => void
}>

// # Tax deactivated
// const TAX_RATE = 0.1
const TAX_RATE = 0 // Tax disabled

export default function CatalogSummary({
  items,
  subtotal,
  totalQuantity,
  onClear,
  onCheckout,
}: CatalogSummaryProps) {
  const { tax, total } = useMemo(() => {
    // # Tax calculation deactivated
    // const computedTax = subtotal * TAX_RATE
    const computedTax = 0 // Tax disabled
    return {
      tax: computedTax,
      // total: subtotal + computedTax,
      total: subtotal, // No tax added
    }
  }, [subtotal])

  return (
    <Card className="sticky top-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">Selection summary</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={items.length === 0}
          onClick={onClear}
          className="text-destructive"
        >
          <SafeIcon name="Trash2" className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Select products from the catalog to start building your order.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 rounded-lg border p-2"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded bg-muted">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 border-t pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Items selected</span>
            <span className="font-semibold">{totalQuantity}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          {/* # Tax display deactivated */}
          {/* <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tax (10%)</span>
            <span className="font-semibold">{formatCurrency(tax)}</span>
          </div> */}
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          type="button"
          className="w-full"
          size="lg"
          onClick={onCheckout}
          disabled={items.length === 0}
        >
          <SafeIcon name="ArrowRight" className="mr-2 h-4 w-4" />
          Proceed to checkout
        </Button>
      </CardFooter>
    </Card>
  )
}

