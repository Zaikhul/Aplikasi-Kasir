'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/dashboard/common/ProductCard'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import { productsApi } from '@/lib/api/products.api'
import { normalizeImageSrc } from '@/lib/image'

export default function ProductGridSection() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsApi.getAll({})
        // Map backend products to frontend format with normalized images
        const mappedProducts = data.slice(0, 8).map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          price: p.price,
          imageUrl: normalizeImageSrc(p.imageUrl),
          category: p.category,
          inventory: p.inventory,
        }))
        setProducts(mappedProducts)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [])
  
  const handleAddProduct = () => {
    router.push('/add-edit-product')
  }

  const handleViewAllProducts = () => {
    router.push('/product-management')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Featured Products</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and view your food items inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleViewAllProducts}
            className="gap-2"
          >
            <SafeIcon name="Eye" className="w-4 h-4" />
            <span className="hidden sm:inline">View All</span>
          </Button>
          <Button 
            onClick={handleAddProduct}
            className="gap-2"
          >
            <SafeIcon name="Plus" className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-card border rounded-lg p-4 animate-pulse">
              <div className="h-48 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No products available. Add your first product to get started.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.imageUrl}
                category={product.category}
                stock={product.inventory}
              />
            ))}
          </div>

          <div className="text-center pt-4">
            <Button 
              variant="ghost"
              onClick={handleViewAllProducts}
              className="gap-2"
            >
              View All Products
              <SafeIcon name="ArrowRight" className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
