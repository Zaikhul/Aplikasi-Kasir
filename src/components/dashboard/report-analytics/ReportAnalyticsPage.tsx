'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StatsCard from '@/components/dashboard/common/StatsCard'
import SalesChart from '@/components/dashboard/report-analytics/SalesChart'
import CategoryChart from '@/components/dashboard/report-analytics/CategoryChart'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import { analyticsApi } from '@/lib/api/analytics.api'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  averageOrderValue: number
  topProducts: Array<{ productId: string; name: string; sales: number; quantity: number }>
  recentOrders: Array<{
    _id?: string
    orderNumber?: string
    total: number
    paymentMethod: string
    createdAt: string
  }>
  lowStockProducts: Array<{ name: string; inventory: number; status: string }>
  salesByCategory: Record<string, number>
  salesByDay: Array<{ date: string; sales: number; orders: number }>
  paymentSummary: Record<string, number>
}

type TopProduct = DashboardStats['topProducts'][number]
type RecentOrder = DashboardStats['recentOrders'][number]
type LowStockProduct = DashboardStats['lowStockProducts'][number]
type SalesDay = DashboardStats['salesByDay'][number]

import { formatCurrency } from '@/lib/currency'

export default function ReportAnalyticsPage() {
  const [dateRange, setDateRange] = useState('month')
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [categorySales, setCategorySales] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const handleExport = () => {
    if (typeof window !== 'undefined') {
      alert('Export functionality would be implemented here')
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        const [stats, categoryData] = await Promise.all([
          analyticsApi.getDashboardStats(),
          analyticsApi.getCategorySales(),
        ])
        setDashboardStats(stats)
        setCategorySales(categoryData)
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadAnalytics()
  }, [])

  const categorySource =
    Object.keys(categorySales).length > 0
      ? categorySales
      : dashboardStats?.salesByCategory ?? {}

  const paymentEntries =
    dashboardStats && dashboardStats.paymentSummary
      ? (Object.entries(dashboardStats.paymentSummary) as Array<[string, number]>)
      : []
  const paymentTotal = paymentEntries.reduce((sum, [, amount]) => sum + amount, 0)

  const categoryChartData = {
    title: 'Product Category Distribution',
    labels: Object.keys(categorySource),
    series: [
      {
        name: 'Sales',
        data: Object.values(categorySource),
      },
    ],
  }

  // Transform sales data for chart
  const salesChartData = dashboardStats?.salesByDay
    ? {
        title: 'Sales Overview',
        labels: dashboardStats.salesByDay.map((d: SalesDay) =>
          new Date(d.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        ),
        series: [
          {
            name: 'Revenue',
            data: dashboardStats.salesByDay.map((d: SalesDay) => d.sales || 0),
          },
        ],
      }
    : null

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your business performance and key metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <SafeIcon name="Download" className="w-4 h-4" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <SafeIcon name="Printer" className="w-4 h-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2">
        {['week', 'month', 'quarter', 'year'].map((range) => (
          <Button
            key={range}
            variant={dateRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange(range)}
            className="capitalize"
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : dashboardStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(dashboardStats.totalRevenue)}
              icon="DollarSign"
            />
            <StatsCard
              title="Total Orders"
              value={dashboardStats.totalOrders?.toLocaleString() || '0'}
              icon="ShoppingCart"
            />
            <StatsCard
              title="Total Products"
              value={dashboardStats.totalProducts?.toLocaleString() || '0'}
              icon="Package"
            />
            <StatsCard
              title="Avg Order Value"
              value={formatCurrency(dashboardStats.averageOrderValue)}
              icon="TrendingUp"
            />
          </div>
        ) : null}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="category">Category Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{salesChartData?.title || 'Sales Overview'}</CardTitle>
              <CardDescription>
                Revenue trends over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salesChartData ? (
                <SalesChart data={salesChartData} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  {loading ? 'Loading sales data...' : 'No sales data available'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{categoryChartData.title}</CardTitle>
              <CardDescription>
                Sales distribution across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryChartData.labels.length > 0 ? (
                <CategoryChart data={categoryChartData} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  {loading ? 'Loading category data...' : 'No category sales data available'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Products</CardTitle>
            <CardDescription>Best sellers this month</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : dashboardStats?.topProducts && dashboardStats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {dashboardStats.topProducts.slice(0, 5).map((product: TopProduct, idx) => (
                  <div
                    key={`${product.productId}-${idx}`}
                    className="flex items-center justify-between pb-4 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.quantity} sold</p>
                    </div>
                    <p className="font-semibold text-primary">{formatCurrency(product.sales)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No product sales data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Breakdown</CardTitle>
            <CardDescription>Revenue by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardStats && Object.keys(dashboardStats.paymentSummary || {}).length > 0 ? (
              <div className="space-y-4">
                {paymentEntries.map(([method, value]) => {
                  const percentage = paymentTotal ? Math.round((value / paymentTotal) * 100) : 0
                  const label =
                    method === 'cash'
                      ? 'Cash'
                      : method === 'card'
                        ? 'Card'
                        : 'Digital'

                  return (
                    <div key={method} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <p className="text-muted-foreground">{label}</p>
                        <p className="font-medium">{formatCurrency(value)}</p>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{percentage}% of revenue</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                {loading ? 'Loading payment data...' : 'No payment data available'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription>Latest recorded orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : dashboardStats?.recentOrders && dashboardStats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {dashboardStats.recentOrders.slice(0, 5).map((order: RecentOrder, idx) => (
                  <div
                    key={order.orderNumber ?? idx}
                    className="flex items-center justify-between pb-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        {order.orderNumber || `Order ${order._id?.toString()?.slice(-6)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No recent transactions available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
            <CardDescription>Products that require restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : dashboardStats?.lowStockProducts && dashboardStats.lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {dashboardStats.lowStockProducts.slice(0, 5).map((product: LowStockProduct, idx) => (
                  <div
                    key={`${product.name}-${idx}`}
                    className="flex items-center justify-between pb-3 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.status}</p>
                    </div>
                    <p className="text-sm font-semibold">{product.inventory} units</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                All products are sufficiently stocked
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation Back */}
      <div className="flex justify-start pt-4">
        <Link href="/dashboard-overview">
          <Button variant="outline" className="gap-2">
            <SafeIcon name="ArrowLeft" className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
