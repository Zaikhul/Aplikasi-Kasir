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

export default function ReportAnalyticsPage() {
  const [dateRange, setDateRange] = useState('month')
  const [dashboardStats, setDashboardStats] = useState<any>(null)
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

  // Transform category sales to chart format
  const categoryChartData = {
    title: 'Product Category Distribution',
    labels: Object.keys(categorySales),
    series: [{
      name: 'Sales',
      data: Object.values(categorySales),
    }],
  }

  // Transform sales data for chart
  const salesChartData = dashboardStats?.salesByDay ? {
    title: 'Sales Overview',
    labels: dashboardStats.salesByDay.map((d: any) => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    series: [{
      name: 'Revenue',
      data: dashboardStats.salesByDay.map((d: any) => d.sales || 0),
    }],
  } : null

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
              value={`$${dashboardStats.totalRevenue?.toLocaleString() || 0}`}
              icon="DollarSign"
              trend={{ value: 0, isPositive: true }}
            />
            <StatsCard
              title="Total Orders"
              value={dashboardStats.totalOrders?.toLocaleString() || '0'}
              icon="ShoppingCart"
              trend={{ value: 0, isPositive: true }}
            />
            <StatsCard
              title="Total Products"
              value={dashboardStats.totalProducts?.toLocaleString() || '0'}
              icon="Package"
              trend={{ value: 0, isPositive: true }}
            />
            <StatsCard
              title="Avg Order Value"
              value={`$${dashboardStats.averageOrderValue?.toFixed(2) || '0.00'}`}
              icon="TrendingUp"
              trend={{ value: 0, isPositive: true }}
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
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : dashboardStats?.topProducts && dashboardStats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {dashboardStats.topProducts.slice(0, 5).map((product: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between pb-4 border-b last:border-0">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.quantity} sold</p>
                    </div>
                    <p className="font-semibold text-primary">${product.sales.toLocaleString()}</p>
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
            <CardTitle className="text-lg">Customer Insights</CardTitle>
            <CardDescription>User engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Total Customers', value: '2,543', change: '+12.5%' },
                { label: 'New Customers', value: '342', change: '+8.2%' },
                { label: 'Repeat Customers', value: '1,201', change: '+15.3%' },
              ].map((metric, idx) => (
                <div key={idx} className="flex items-center justify-between pb-4 border-b last:border-0">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <div className="text-right">
                    <p className="font-semibold">{metric.value}</p>
                    <p className="text-xs text-green-600">{metric.change}</p>
                  </div>
                </div>
              ))}
            </div>
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
