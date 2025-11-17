'use client'

import { useState } from 'react'
import ResponsiveProductGrid from './ResponsiveProductGrid'
import ResponsiveDashboardStats from './ResponsiveStat'
import ResponsiveDashboardGraph from './ResponsiveGraph'

// Mock data for products
const mockProducts = [
  {
    id: '1',
    name: 'Grilled Salmon',
    price: 24.99,
    image: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/d17c60f9-a97a-4410-987a-04d0faf1609f.png',
    category: 'Seafood',
    stock: 15
  },
  {
    id: '2',
    name: 'Caesar Salad',
    price: 12.99,
    image: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/5be35a44-2a0a-4d87-b636-b79fafdacb5f.png',
    category: 'Salads',
    stock: 25
  },
  {
    id: '3',
    name: 'Margherita Pizza',
    price: 16.99,
    image: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/8e586eac-eac3-4fba-9358-94134b459e94.png',
    category: 'Pizza',
    stock: 20
  },
  {
    id: '4',
    name: 'Beef Burger',
    price: 14.99,
    image: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/62fb09c5-1496-47f8-98dc-e361f86883b1.png',
    category: 'Burgers',
    stock: 18
  },
  {
    id: '5',
    name: 'Pad Thai',
    price: 13.99,
    image: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/1f61141e-3bec-433d-aff6-a12d1862c2c1.png',
    category: 'Asian',
    stock: 12
  },
  {
    id: '6',
    name: 'Chocolate Cake',
    price: 8.99,
    image: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/99f6515e-71c3-4f0c-984d-849d50d97eeb.png',
    category: 'Desserts',
    stock: 30
  },
  {
    id: '7',
    name: 'Spaghetti Carbonara',
    price: 15.99,
    image: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/87d5317a-6e00-47b2-b28f-464af32295e5.png',
    category: 'Pasta',
    stock: 16
  },
  {
    id: '8',
    name: 'Chicken Tikka Masala',
    price: 17.99,
    image: 'https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/6f6a643c-4d3b-460e-9029-7197db47e3c9.png',
    category: 'Indian',
    stock: 14
  }
]

// Mock stats data
const mockStats = [
  {
    title: 'Total Orders',
    value: '1,234',
    icon: 'ShoppingCart',
    trend: { value: 12, isPositive: true },
    description: 'Orders this month'
  },
  {
    title: 'Revenue',
    value: '$45,231',
    icon: 'DollarSign',
    trend: { value: 8, isPositive: true },
    description: 'Total revenue'
  },
  {
    title: 'Active Products',
    value: '156',
    icon: 'Package',
    trend: { value: 5, isPositive: true },
    description: 'In inventory'
  },
  {
    title: 'Customers',
    value: '892',
    icon: 'Users',
    trend: { value: 3, isPositive: false },
    description: 'Active customers'
  }
]

export default function DashboardResponsiveView() {
  const [products] = useState(mockProducts)
  const [stats] = useState(mockStats)

  return (
    <div className="w-full h-full bg-background">
      {/* Desktop Layout - Side by side */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6 p-6">
        {/* Left side - Product Grid (2 columns) */}
        <div className="lg:col-span-2">
          <ResponsiveProductGrid products={products} />
        </div>

        {/* Right side - Stats and Graph (1 column) */}
        <div className="space-y-6">
          <ResponsiveDashboardStats stats={stats} />
          <ResponsiveDashboardGraph />
        </div>
      </div>

      {/* Tablet Layout - Stacked with 2-column grid */}
      <div className="hidden md:block lg:hidden p-6 space-y-6">
        <ResponsiveDashboardStats stats={stats} />
        <ResponsiveProductGrid products={products} />
        <ResponsiveDashboardGraph />
      </div>

      {/* Mobile Layout - Full width stacked */}
      <div className="md:hidden p-4 space-y-4">
        <ResponsiveDashboardStats stats={stats} />
        <ResponsiveProductGrid products={products} />
        <ResponsiveDashboardGraph />
      </div>
    </div>
  )
}
