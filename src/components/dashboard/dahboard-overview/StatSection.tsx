'use client'

import { useState, useEffect } from 'react'
import StatsCard from '@/components/dashboard/common/StatsCard'
import { analyticsApi } from '@/lib/api/analytics.api'
import { formatCurrency } from '@/lib/currency'

export default function StatsSection() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await analyticsApi.getDashboardStats()
        setStats({
          totalRevenue: data.totalRevenue || 0,
          totalOrders: data.totalOrders || 0,
          totalProducts: data.totalProducts || 0,
          averageOrderValue: data.averageOrderValue || 0,
        })
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2"></div>
            <div className="h-8 bg-muted rounded w-32"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        icon="DollarSign"
        trend={{ value: 0, isPositive: true }}
      />
      <StatsCard
        title="Total Orders"
        value={stats.totalOrders.toLocaleString()}
        icon="ShoppingCart"
        trend={{ value: 0, isPositive: true }}
      />
      <StatsCard
        title="Total Products"
        value={stats.totalProducts.toLocaleString()}
        icon="Package"
        trend={{ value: 0, isPositive: true }}
      />
      <StatsCard
        title="Avg Order Value"
        value={formatCurrency(stats.averageOrderValue)}
        icon="TrendingUp"
        trend={{ value: 0, isPositive: true }}
      />
    </div>
  )
}
