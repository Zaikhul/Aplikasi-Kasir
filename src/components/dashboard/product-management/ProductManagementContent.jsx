
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import ProductManagementGrid from './ProductManagementGrid'
import ProductManagementTable from './ProductManagementTable'
import { ALL_PRODUCTS } from '@/data/products'
import type { IProductModel } from '@/data/products'

export default function ProductManagementContent() {
  const [products, setProducts] = useState<IProductModel[]>(ALL_PRODUCTS)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [filteredProducts, setFilteredProducts] = useState<IProductModel[]>(ALL_PRODUCTS)

  const router = useRouter()

  useEffect(() => {
    // Handle search query from URL
    const searchQuery = router.query.q as string | undefined
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [products, router.query.q])

  const handleAddProduct = () => {
    router.push('/add-edit-product')
  }

  const handleEditProduct = (id: string) => {
    router.push(`/add-edit-product?id=${id}`)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const handleViewDetails = (id) => {
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Products</p>
          <p className="text-2xl font-bold mt-1">{products.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">In Stock</p>
          <p className="text-2xl font-bold mt-1">
            {products.filter(p => p.status === 'In Stock').length}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Low Stock</p>
          <p className="text-2xl font-bold mt-1">
            {products.filter(p => p.status === 'Low Stock').length}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Out of Stock</p>
          <p className="text-2xl font-bold mt-1">
            {products.filter(p => p.status === 'Out of Stock').length}
          </p>
        </div>
      </div>

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
