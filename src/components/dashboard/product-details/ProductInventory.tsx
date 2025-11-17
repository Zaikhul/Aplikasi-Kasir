'use client'

import SafeIcon from '@/components/dashboard/common/SafeIcon'
import type { ProductStatus } from '@/data/products'

interface ProductInventoryProps {
  inventory: number
  sku: string
  status: ProductStatus
  createdAt?: string
}

export default function ProductInventory({
  inventory,
  sku,
  status,
  createdAt,
}: ProductInventoryProps) {
  const formatDate = (value?: string) => {
    if (!value) return 'N/A'
    try {
      return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(value))
    } catch {
      return value
    }
  }

  const inventoryColor =
    inventory === 0
      ? 'text-red-600'
      : inventory < 10
        ? 'text-yellow-600'
        : 'text-green-600'

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Inventory Details</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <SafeIcon name="Package" className="h-5 w-5" />
            Stock Level
          </div>
          <span className={`font-semibold ${inventoryColor}`}>
            {inventory} units ({status})
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <SafeIcon name="Barcode" className="h-5 w-5" />
            SKU
          </div>
          <span className="font-mono text-sm font-semibold">{sku}</span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <SafeIcon name="Calendar" className="h-5 w-5" />
            Added
          </div>
          <span className="text-sm font-semibold">{formatDate(createdAt)}</span>
        </div>
      </div>
    </section>
  )
}


