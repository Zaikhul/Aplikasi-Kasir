'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { analyticsApi } from '@/lib/api/analytics.api'
import SafeIcon from '@/components/dashboard/common/SafeIcon'

export default function SalesChartSection() {
  const [salesData, setSalesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        const data = await analyticsApi.getDashboardStats()
        setSalesData(data.salesByDay || [])
      } catch (error) {
        console.error('Error loading sales data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadSalesData()
  }, [])

  const maxValue = salesData.length > 0 ? Math.max(...salesData.map(d => d.sales || 0)) : 1
  
  const totalSales = salesData.reduce((sum, d) => sum + (d.sales || 0), 0)
  const totalOrders = salesData.reduce((sum, d) => sum + (d.orders || 0), 0)
  const avgDailySales = salesData.length > 0 ? totalSales / salesData.length : 0

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted rounded animate-pulse"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main Chart Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Daily Sales</CardTitle>
          <CardDescription>Revenue trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          {salesData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No sales data available
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Daily Sales</span>
                  <span className="text-xs text-muted-foreground">
                    Peak: ${Math.max(...salesData.map(d => d.sales || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-end gap-2 h-32">
                  {salesData.slice(-7).map((data, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${((data.sales || 0) / maxValue) * 100}%` }}
                        title={`${data.date}: $${(data.sales || 0).toLocaleString()}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <SafeIcon name="TrendingUp" className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Avg Daily Sales</p>
                <p className="text-xs text-muted-foreground">
                  ${avgDailySales.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <SafeIcon name="BarChart3" className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Total Sales</p>
                <p className="text-xs text-muted-foreground">
                  ${totalSales.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <SafeIcon name="ShoppingCart" className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Total Orders</p>
                <p className="text-xs text-muted-foreground">
                  {totalOrders.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
