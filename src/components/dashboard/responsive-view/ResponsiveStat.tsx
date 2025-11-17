'use client'

import StatsCard from '@/components/dashboard/common/StatsCard'

interface Stat {
  title: string
  value: string | number
  icon: string
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
}

interface ResponsiveDashboardStatsProps {
  stats: Stat[]
}

export default function ResponsiveDashboardStats({ stats }: ResponsiveDashboardStatsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard Stats</h2>
        <p className="text-muted-foreground">Key metrics and performance indicators</p>
      </div>

      {/* Responsive Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            description={stat.description}
          />
        ))}
      </div>
    </div>
  )
}
