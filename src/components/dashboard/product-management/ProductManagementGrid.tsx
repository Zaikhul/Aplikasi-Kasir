'use client'

import Image from 'next/image'
import { useRouter } from 'next/router'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import EmptyState from '@/components/dashboard/common/EmptyState'
import type { IProductModel } from '@/data/products'
import { normalizeImageSrc } from '@/lib/image'
import { formatCurrency } from '@/lib/currency'

interface ProductManagementGridProps {
  readonly products: IProductModel[]
  readonly onEdit: (id: string) => void
  readonly onDelete: (id: string) => void
  readonly onViewDetails: (id: string) => void
}

const getStatusColor = (status: string) => {
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
}

export default function ProductManagementGrid({
  products,
  onEdit,
  onDelete,
  onViewDetails,
}: ProductManagementGridProps) {
  const router = useRouter()
  
  if (products.length === 0) {
    return (
      <EmptyState
        icon="Package"
        title="No products found"
        description="Start by adding your first food item to the inventory"
        actionLabel="Add Product"
        onAction={() => {
          router.push('/add-edit-product')
        }}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onViewDetails(product.id)}
        >
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={normalizeImageSrc(product.imageUrl)}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={false}
            />
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
              <Badge variant="outline" className="shrink-0 text-xs">
                {product.category}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-primary">{formatCurrency(product.price)}</p>
                <div className="flex items-center gap-1">
                  <SafeIcon name="Star" className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{product.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {product.inventory} units
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(product.id)}
            >
              <SafeIcon name="Edit" className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(product.id)}
            >
              <SafeIcon name="Trash2" className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
