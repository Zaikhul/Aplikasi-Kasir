'use client'

import { useState } from 'react'
import StatsSection from './StatSection'
import ProductGridSection from './ProductGridSection'
import SalesChartSection from './SalesChartSection'

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Section */}
      <StatsSection />

      {/* Charts Section */}
      <SalesChartSection />

      {/* Product Grid Section */}
      <ProductGridSection />
    </div>
  )
}
