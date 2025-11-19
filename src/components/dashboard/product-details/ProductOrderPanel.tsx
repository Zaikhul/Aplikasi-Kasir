'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import { productsApi } from '@/lib/api/products.api'
import { formatCurrency } from '@/lib/currency'

interface ProductOrderPanelProps {
  readonly productId: string
  readonly price: number
  readonly inventory: number
  readonly onInventoryChange?: (nextInventory: number) => void
}

function getStatusFromInventory(inventory: number): string {
  if (inventory === 0) return 'Out of Stock'
  if (inventory < 10) return 'Low Stock'
  return 'In Stock'
}

export default function ProductOrderPanel({
  productId,
  price,
  inventory,
  onInventoryChange,
}: ProductOrderPanelProps) {
  const [quantity, setQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] =
    useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const restockValue = useMemo(() => price * quantity, [price, quantity])

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1)
  }

  const handleRestock = async () => {
    if (quantity <= 0 || isProcessing) {
      return
    }

    setIsProcessing(true)
    setFeedback(null)

    try {
      const nextInventory = inventory + quantity
      const status = getStatusFromInventory(nextInventory)
      await productsApi.update(productId, {
        inventory: nextInventory,
        status,
        isAvailable: status !== 'Out of Stock',
      })
      onInventoryChange?.(nextInventory)
      setQuantity(1)
      setFeedback({
        type: 'success',
        message: `Inventory increased by ${quantity} units.`,
      })
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update inventory. Please try again.'
      setFeedback({ type: 'error', message })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground">Restock inventory</p>
        <p className="text-xs text-muted-foreground">
          Add new stock quantities without processing a sale.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Quantity to add</p>
            <p className="text-lg font-semibold">{quantity}</p>
            <p className="text-xs text-muted-foreground">
              Current stock: {inventory} ({getStatusFromInventory(inventory)})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="icon" variant="outline" onClick={handleDecrease}>
              <SafeIcon name='minus' className="h-4 w-4" />
            </Button>
            <Button type="button" size="icon" variant="outline" onClick={handleIncrease}>
              <SafeIcon name='plus' className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-white/50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estimated stock value</span>
            <span className="font-semibold">{formatCurrency(restockValue)}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            feedback.type === 'success'
              ? 'border-green-600 text-green-700'
              : 'border-destructive text-destructive'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <Button className="mt-4 w-full gap-2" onClick={handleRestock} disabled={isProcessing}>
        <SafeIcon name="PackagePlus" className="h-4 w-4" />
        {isProcessing ? 'Updating...' : 'Update stock level'}
      </Button>
    </div>
  )
}


