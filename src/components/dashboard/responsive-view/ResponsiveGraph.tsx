'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SafeIcon from '@/components/dashboard/common/SafeIcon'

export default function ResponsiveDashboardGraph() {
  // Mock chart data
  const chartData = [
    { month: 'Jan', sales: 4000, orders: 240 },
    { month: 'Feb', sales: 3000, orders: 221 },
    { month: 'Mar', sales: 2000, orders: 229 },
    { month: 'Apr', sales: 2780, orders: 200 },
    { month: 'May', sales: 1890, orders: 229 },
    { month: 'Jun', sales: 2390, orders: 200 },
  ]

  // Calculate max value for scaling
  const maxSales = Math.max(...chartData.map(d => d.sales))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Monthly sales and order trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Simple bar chart representation */}
          <div className="space-y-4">
            {chartData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{data.month}</span>
                  <span className="text-muted-foreground">${data.sales.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-primary/70 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(data.sales / maxSales) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Chart legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/50" />
              <span className="text-xs text-muted-foreground">Orders</span>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Sales</p>
              <p className="text-lg font-bold">$20,040</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-lg font-bold">1,319</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
