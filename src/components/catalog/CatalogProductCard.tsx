'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import type { IProductModel } from '@/data/products'
import { formatCurrency } from '@/lib/currency'

type CatalogProductCardProps = Readonly<{
  product: IProductModel
  selectedQuantity: number
  onToggleSelect: (product: IProductModel) => void
  onQuantityChange: (product: IProductModel, quantity: number) => void
}>

export default function CatalogProductCard({
  product,
  selectedQuantity,
  onToggleSelect,
  onQuantityChange,
}: CatalogProductCardProps) {
  const isSelected = selectedQuantity > 0
  const canIncrease = selectedQuantity < product.inventory
  const canDecrease = selectedQuantity > 1

  return (
    <Card
      className={`overflow-hidden border-2 transition-all ${
        isSelected ? 'border-primary shadow-lg' : 'border-transparent shadow-sm'
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Image
          src={product.imageUrl || '/placeholder.svg'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {product.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Stock</p>
            <p className="font-semibold">{product.inventory} units</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 p-4 pt-0">
        {isSelected && (
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onQuantityChange(product, selectedQuantity - 1)}
                disabled={!canDecrease}
              >
                <SafeIcon name="Minus" className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-semibold">{selectedQuantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onQuantityChange(product, selectedQuantity + 1)}
                disabled={!canIncrease}
              >
                <SafeIcon name="Plus" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Button
          type="button"
          variant={isSelected ? 'secondary' : 'default'}
          onClick={() => onToggleSelect(product)}
          className="w-full"
        >
          <SafeIcon
            name={isSelected ? 'CheckCircle2' : 'ShoppingCart'}
            className="mr-2 h-4 w-4"
          />
          {isSelected ? 'Selected' : 'Add to selection'}
        </Button>
      </CardFooter>
    </Card>
  )
}

