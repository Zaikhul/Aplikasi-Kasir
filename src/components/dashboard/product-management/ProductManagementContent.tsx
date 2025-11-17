
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import ProductManagementGrid from './ProductManagementGrid'
import ProductManagementTable from './ProductManagementTable'
import { productsApi } from '@/lib/api/products.api'
import type { IProductModel } from '@/data/products'

export default function ProductManagementContent() {
  const [products, setProducts] = useState<IProductModel[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [filteredProducts, setFilteredProducts] = useState<IProductModel[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 })

  const router = useRouter()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const searchQuery = router.query.q as string | undefined
        
        const [productsData, statsData] = await Promise.all([
          productsApi.getAll({ search: searchQuery }),
          productsApi.getStats(),
        ])
        
        // Map backend product to frontend IProductModel
        const { normalizeImageSrc } = await import('@/lib/image')
        const mappedProducts = productsData.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          category: p.category,
          inventory: p.inventory,
          sku: p.sku,
          imageUrl: normalizeImageSrc(p.imageUrl),
          detailedImages: (p.detailedImages?.map((img: any) => {
            const url = typeof img === 'string' ? img : img?.url
            return normalizeImageSrc(url)
          }) || []).filter(Boolean),
          status: p.status || (p.inventory === 0 ? 'Out of Stock' : p.inventory < 10 ? 'Low Stock' : 'In Stock'),
          rating: p.rating || 0,
        }))
        
        setProducts(mappedProducts)
        setFilteredProducts(mappedProducts)
        setStats({
          total: statsData.total || 0,
          inStock: statsData.inStock || 0,
          lowStock: statsData.lowStock || 0,
          outOfStock: statsData.outOfStock || 0,
        })
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [router.query.q])

  const handleAddProduct = () => {
    router.push('/add-edit-product')
  }

  const handleEditProduct = (id: string) => {
    router.push(`/add-edit-product?id=${id}`)
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productsApi.delete(id)
        setProducts(products.filter(p => p.id !== id))
        setFilteredProducts(filteredProducts.filter(p => p.id !== id))
      } catch (error) {
        console.error('Error deleting product:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        alert('Failed to delete product: ' + errorMessage)
      }
    }
  }

  const handleViewDetails = (id: string) => {
    router.push(`/product/${id}`)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your food items inventory and details
          </p>
        </div>
        <Button onClick={handleAddProduct} className="gap-2">
          <SafeIcon name="Plus" className="w-4 h-4" />
          Add New Product
        </Button>
      </div>

      {/* Stats Overview */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card border rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
              <div className="h-8 bg-muted rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">In Stock</p>
            <p className="text-2xl font-bold mt-1">{stats.inStock}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Low Stock</p>
            <p className="text-2xl font-bold mt-1">{stats.lowStock}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Out of Stock</p>
            <p className="text-2xl font-bold mt-1">{stats.outOfStock}</p>
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'table')} className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="grid" className="gap-2">
            <SafeIcon name="Grid" className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="gap-2">
            <SafeIcon name="List" className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <ProductManagementGrid
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <ProductManagementTable
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
