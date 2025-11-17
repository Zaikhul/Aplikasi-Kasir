'use client'

import Image from 'next/image'
import { useRouter } from 'next/router'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import { normalizeImageSrc } from '@/lib/image'

interface ProductCardProps {
  readonly id: string
  readonly name: string
  readonly price: number
  readonly image: string
  readonly category?: string
  readonly stock?: number
  readonly onEdit?: (id: string) => void
  readonly onDelete?: (id: string) => void
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  category,
  stock,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const router = useRouter()
  const normalizedImage = normalizeImageSrc(image)

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="flex w-full flex-col text-left">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={normalizedImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
            {category && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                {category}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-primary">
              Rp {price.toLocaleString('id-ID')}
            </p>
            {stock !== undefined && (
              <p className={`text-sm ${stock > 0 ? 'text-muted-foreground' : 'text-destructive'}`}>
                {stock > 0 ? `${stock} in stock` : 'Out of stock'}
              </p>
            )}
          </div>
        </CardContent>
      </div>
      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => router.push(`/product/${id}`)}
        >
          <SafeIcon name="Eye" className="mr-2 h-4 w-4" />
          View
        </Button>
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(id)}
          >
            <SafeIcon name="Edit" className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(id)}
          >
            <SafeIcon name="Trash2" className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
