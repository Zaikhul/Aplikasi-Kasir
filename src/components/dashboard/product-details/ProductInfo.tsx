'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import type { ProductCategory, ProductStatus } from '@/data/products'
import { formatCurrency } from '@/lib/currency'

interface ProductInfoProps {
  name: string
  price: number
  rating: number
  category: ProductCategory
  status: ProductStatus
}

export default function ProductInfo({
  name,
  price,
  rating,
  category,
  status,
}: ProductInfoProps) {
  const priceLabel = useMemo(() => formatCurrency(price), [price])

  const statusColor = (() => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800'
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'Out of Stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  })()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="mb-2 text-3xl font-bold">{name}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{category}</Badge>
          <Badge className={statusColor}>{status}</Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <SafeIcon
              key={index}
              name="Star"
              className={`h-4 w-4 ${
                index < Math.round(rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {rating.toFixed(1)} out of 5
        </span>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-muted-foreground">Price</p>
        <p className="text-4xl font-bold text-primary">{priceLabel}</p>
      </div>
    </div>
  )
}


