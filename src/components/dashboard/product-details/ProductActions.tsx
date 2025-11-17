'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import { productsApi } from '@/lib/api/products.api'

interface ProductActionsProps {
  productId: string
}

export default function ProductActions({ productId }: ProductActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = () => {
    router.push(`/add-edit-product?id=${productId}`)
  }

  const handleBack = () => {
    router.push('/product-management')
  }

  const handleDelete = async () => {
    if (isDeleting) return

    const confirmed =
      typeof globalThis !== 'undefined' && globalThis.confirm
        ? globalThis.confirm('Are you sure you want to delete this product?')
        : false

    if (!confirmed) return

    try {
      setIsDeleting(true)
      await productsApi.delete(productId)
      handleBack()
    } catch (error) {
      console.error('Failed to delete product:', error)
      const message =
        error instanceof Error ? error.message : 'Failed to delete product. Please try again.'
      if (typeof globalThis !== 'undefined' && globalThis.alert) {
        globalThis.alert(message)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" size="lg" onClick={handleEdit}>
        <SafeIcon name="Edit" className="mr-2 h-4 w-4" />
        Edit Product
      </Button>
      <Button
        className="w-full"
        size="lg"
        variant="destructive"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <SafeIcon name="Trash2" className="mr-2 h-4 w-4" />
        {isDeleting ? 'Deleting...' : 'Delete Product'}
      </Button>
      <Button
        variant="outline"
        className="w-full"
        size="lg"
        onClick={handleBack}
        disabled={isDeleting}
      >
        <SafeIcon name="ArrowLeft" className="mr-2 h-4 w-4" />
        Back to Products
      </Button>
    </div>
  )
}

