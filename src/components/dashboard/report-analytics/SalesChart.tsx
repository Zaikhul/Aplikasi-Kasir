'use client'

import { useMemo } from 'react'
import type { IChartDataModel } from '@/data/dashboard'
import SafeIcon from '@/components/dashboard/common/SafeIcon'

interface SalesChartProps {
  data: IChartDataModel
}

export default function SalesChart({ data }: SalesChartProps) {
  const chartData = useMemo(() => {
    if (!data || !data.series || data.series.length === 0) {
      return null
    }

    // Find max value for scaling
    const allValues = data.series.flatMap(s => s.data)
    const maxValue = Math.max(...allValues)
    const scale = 100 / maxValue

    return { scale, maxValue }
  }, [data])

  if (!chartData) {
    return <div className="text-center py-8 text-muted-foreground">No data available</div>
  }

  return (
    <div className="w-full space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-6">
        {data.series.map((series, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: idx === 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'
              }}
            />
            <span className="text-sm font-medium">{series.name}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {data.labels.map((label, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground w-12">{label}</span>
              <div className="flex-1 flex gap-2 ml-4">
                {data.series.map((series, seriesIdx) => {
                  const value = series.data[idx]
                  const height = (value * chartData.scale) + 20
                  return (
                    <div key={seriesIdx} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full rounded-t transition-all hover:opacity-80"
                        style={{
                          height: `${height}px`,
                          backgroundColor: seriesIdx === 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))',
                          opacity: 0.8
                        }}
                        title={`${series.name}: ${value}k`}
                      />
                      <span className="text-xs text-muted-foreground mt-1">{value}k</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
        {data.series.map((series, idx) => {
          const total = series.data.reduce((a, b) => a + b, 0)
          const average = (total / series.data.length).toFixed(1)
          return (
            <div key={idx} className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{series.name}</p>
              <p className="text-lg font-semibold">{total}k</p>
              <p className="text-xs text-muted-foreground">Avg: {average}k</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
