import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ProtectedRoute from '@/pages/auth/ProtectedRoute'
import DashboardLayout from '@/components/dashboard/common/Dashboard-Layout'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { productsApi } from '@/lib/api/products.api'
import { normalizeImageSrc } from '@/lib/image'
import ProductGallery from '@/components/dashboard/product-details/ProductGallery'
import ProductInfo from '@/components/dashboard/product-details/ProductInfo'
import ProductDescription from '@/components/dashboard/product-details/ProductDescription'
import ProductInventory from '@/components/dashboard/product-details/ProductInventory'
import ProductActions from '@/components/dashboard/product-details/ProductActions'
import ProductOrderPanel from '@/components/dashboard/product-details/ProductOrderPanel'
import type { ProductCategory, ProductStatus } from '@/data/products'

interface ProductDetails {
  id: string
  name: string
  description: string
  price: number
  category: ProductCategory
  inventory: number
  sku: string
  imageUrl: string
  detailedImages: string[]
  status: ProductStatus
  rating: number
  createdAt?: string
}

type ProductResponse = {
  _id?: string
  id?: string
  name?: string
  description?: string
  price?: number
  category?: ProductCategory
  inventory?: number
  sku?: string
  imageUrl?: string
  detailedImages?: Array<string | { url?: string }>
  status?: ProductStatus
  rating?: number
  createdAt?: string
  updatedAt?: string
}

function deriveStatusFromInventory(inventory: number): ProductStatus {
  if (inventory === 0) {
    return 'Out of Stock'
  }
  if (inventory < 10) {
    return 'Low Stock'
  }
  return 'In Stock'
}

function mapProductResponse(data: ProductResponse): ProductDetails {
  const inventory = data.inventory ?? 0
  const fallbackStatus: ProductStatus = deriveStatusFromInventory(inventory)

  const detailedImages =
    data.detailedImages?.map((img) => {
      const url = typeof img === 'string' ? img : img?.url ?? ''
      return normalizeImageSrc(url)
    }) ?? []

  return {
    id: data._id ?? data.id ?? '',
    name: data.name ?? 'Unnamed Product',
    description: data.description ?? '',
    price: data.price ?? 0,
    category: data.category ?? 'Mains',
    inventory,
    sku: data.sku ?? 'N/A',
    imageUrl: normalizeImageSrc(data.imageUrl),
    detailedImages: detailedImages.filter(Boolean),
    status: data.status ?? fallbackStatus,
    rating: typeof data.rating === 'number' ? data.rating : 0,
    createdAt: data.createdAt ?? data.updatedAt,
  }
}

function ProductDetailsContent() {
  const router = useRouter()
  const { id } = router.query

  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!router.isReady || typeof id !== 'string') {
      return
    }

    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await productsApi.getById(id)
        setProduct(mapProductResponse(response))
      } catch (err) {
        console.error('Failed to load product', err)
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load product. Please try again.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, router.isReady])

  const pageTitle = useMemo(
    () => (product ? `${product.name} · Product Details` : 'Product Details'),
    [product],
  )

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((key) => (
                  <div key={key} className="h-20 animate-pulse rounded bg-muted" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((key) => (
                <div key={key} className="h-24 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (error || !product) {
      return (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-lg font-semibold text-destructive">
            {error || 'Product not found'}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            The product you are looking for might have been removed.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push('/product-management')}
          >
            Back to Products
          </Button>
        </div>
      )
    }

    const handleInventoryChange = (nextInventory: number) => {
      setProduct((prev) => {
        if (!prev) {
          return prev
        }
        return {
          ...prev,
          inventory: nextInventory,
          status: deriveStatusFromInventory(nextInventory),
        }
      })
    }

    return (
      <>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/product-management" className="hover:text-foreground">
            Products
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProductGallery
              key={product.id}
              mainImage={product.imageUrl}
              detailedImages={product.detailedImages}
              productName={product.name}
            />
          </div>

          <div className="space-y-6">
            <ProductInfo
              name={product.name}
              price={product.price}
              rating={product.rating}
              category={product.category}
              status={product.status}
            />
            <Separator />
            <ProductOrderPanel
              productId={product.id}
              price={product.price}
              inventory={product.inventory}
              onInventoryChange={handleInventoryChange}
            />
            <Separator />
            <ProductInventory
              inventory={product.inventory}
              sku={product.sku}
              status={product.status}
              createdAt={product.createdAt}
            />
            <Separator />
            <ProductActions productId={product.id} />
          </div>
        </div>

        <Separator className="my-8" />
        <ProductDescription description={product.description} />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <DashboardLayout>
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
          {renderContent()}
        </div>
      </DashboardLayout>
    </>
  )
}

export default function ProductDetailsPage() {
  return (
    <ProtectedRoute>
      <ProductDetailsContent />
    </ProtectedRoute>
  )
}


