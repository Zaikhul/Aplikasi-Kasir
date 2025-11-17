'use client'

import { useRouter } from 'next/router'
import ProductCard from '@/components/dashboard/common/ProductCard'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category?: string
  stock?: number
}

interface ResponsiveProductGridProps {
  products: Product[]
}

export default function ResponsiveProductGrid({ products }: ResponsiveProductGridProps) {
  const router = useRouter()
  
  const handleViewDetails = (id: string) => {
    router.push(`/product/${id}`)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Featured Products</h2>
        <p className="text-muted-foreground">Browse our delicious food items</p>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleViewDetails(product.id)}
            className="cursor-pointer"
          >
            <ProductCard
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              category={product.category}
              stock={product.stock}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
