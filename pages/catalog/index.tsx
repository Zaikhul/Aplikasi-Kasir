import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/dashboard/common/Dashboard-Layout'
import ProtectedRoute from '@/pages/auth/ProtectedRoute'
import CatalogProductCard from '@/components/catalog/CatalogProductCard'
import CatalogSummary from '@/components/catalog/CatalogSummary'
import type { IProductModel } from '@/data/products'
import { productsApi } from '@/lib/api/products.api'
import {
  calculateCatalogTotals,
  loadCatalogSelection,
  saveCatalogSelection,
  type CatalogSelectionItem,
} from '@/lib/catalog-selection'
import { normalizeImageSrc } from '@/lib/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SafeIcon from '@/components/dashboard/common/SafeIcon'

type SelectionMap = Record<string, CatalogSelectionItem>

export default function CatalogPage() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Product Catalog - Kasir Pintar</title>
      </Head>
      <DashboardLayout headerPlaceholder="Search catalog...">
        <CatalogContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function CatalogContent() {
  const router = useRouter()
  const [products, setProducts] = useState<IProductModel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selection, setSelection] = useState<SelectionMap>(() =>
    loadCatalogSelection().reduce<SelectionMap>((acc, item) => {
      acc[item.productId] = item
      return acc
    }, {}),
  )

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const fetchedProducts = await productsApi.getAll()
        const normalizedProducts = fetchedProducts.map((product: any) => ({
          id: product._id || product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          category: product.category,
          inventory: product.inventory,
          sku: product.sku,
          imageUrl: normalizeImageSrc(product.imageUrl),
          detailedImages: [],
          status:
            product.status ||
            (product.inventory === 0
              ? 'Out of Stock'
              : product.inventory < 10
                ? 'Low Stock'
                : 'In Stock'),
          rating: product.rating || 0,
        }))
        setProducts(normalizedProducts)
      } catch (error) {
        console.error('Failed to load catalog products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products
    }
    const term = searchTerm.toLowerCase()
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term),
    )
  }, [products, searchTerm])

  const persistSelection = (updater: (prev: SelectionMap) => SelectionMap) => {
    setSelection((prevSelection) => {
      const nextSelection = updater(prevSelection)
      saveCatalogSelection(Object.values(nextSelection))
      return nextSelection
    })
  }

  const handleToggleSelect = (product: IProductModel) => {
    persistSelection((prevSelection) => {
      const nextSelection = { ...prevSelection }
      if (nextSelection[product.id]) {
        delete nextSelection[product.id]
        return nextSelection
      }
      nextSelection[product.id] = {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        quantity: 1,
      }
      return nextSelection
    })
  }

  const handleQuantityChange = (product: IProductModel, nextQuantity: number) => {
    if (nextQuantity <= 0) {
    persistSelection((prev) => {
        const next = { ...prev }
        delete next[product.id]
      return next
    })
      return
    }

    persistSelection((prevSelection) => {
      const nextSelection = { ...prevSelection }
      const limitedQuantity = Math.min(nextQuantity, product.inventory)
      nextSelection[product.id] = {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        quantity: limitedQuantity,
      }
      return nextSelection
    })
  }

  const handleClearSelection = () => {
    persistSelection(() => ({}))
  }

  const handleCheckout = () => {
    if (Object.keys(selection).length === 0) {
      return
    }
    router.push('/checkout/catalog')
  }

  const selectedItems = Object.values(selection)
  const { subtotal, totalQuantity } = calculateCatalogTotals(selectedItems)

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product catalog</h1>
          <p className="text-muted-foreground">Select multiple items and build a checkout order.</p>
        </div>
        <div className="flex w-full max-w-lg items-center gap-3">
          <Input
            placeholder="Search by name, category, or keyword"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setSearchTerm('')}
            disabled={!searchTerm}
          >
            <SafeIcon name="XCircle" className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="h-64 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <SafeIcon name="Search" className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search to find other menu items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <CatalogProductCard
                  key={product.id}
                  product={product}
                  selectedQuantity={selection[product.id]?.quantity ?? 0}
                  onToggleSelect={handleToggleSelect}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
          )}
        </div>

        <CatalogSummary
          items={selectedItems}
          subtotal={subtotal}
          totalQuantity={totalQuantity}
          onClear={handleClearSelection}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  )
}

