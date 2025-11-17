'use client'

import Image from 'next/image'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import EmptyState from '@/components/dashboard/common/EmptyState'
import type { IProductModel } from '@/data/products'
import { normalizeImageSrc } from '@/lib/image'

interface ProductManagementTableProps {
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

export default function ProductManagementTable({
  products,
  onEdit,
  onDelete,
  onViewDetails,
}: ProductManagementTableProps) {
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
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-center">Inventory</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onViewDetails(product.id)}
            >
              <TableCell>
                <div className="relative h-10 w-10 overflow-hidden rounded">
                  <Image
                    src={normalizeImageSrc(product.imageUrl)}
                    alt={product.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{product.category}</Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                Rp. {product.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-center">{product.inventory}</TableCell>
              <TableCell>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <SafeIcon name="Star" className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{product.rating}</span>
                </div>
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product.id)}
                  >
                    <SafeIcon name="Edit" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(product.id)}
                  >
                    <SafeIcon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
