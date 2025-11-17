'use client'

import { useMemo } from 'react'
import type { ReactElement } from 'react'
import type { IChartDataModel } from '@/data/dashboard'

interface CategoryChartProps {
  data: IChartDataModel
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const chartData = useMemo(() => {
    if (!data || !data.series || data.series.length === 0) {
      return null
    }

    const values = data.series[0].data
    const total = values.reduce((a, b) => a + b, 0)
    
    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ]

    return {
      total,
      segments: data.labels.map((label, idx) => ({
        label,
        value: values[idx],
        percentage: ((values[idx] / total) * 100).toFixed(1),
        color: colors[idx % colors.length]
      }))
    }
  }, [data])

  if (!chartData) {
    return <div className="text-center py-8 text-muted-foreground">No data available</div>
  }

  return (
    <div className="w-full space-y-6">
      {/* Pie Chart */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {chartData.segments.reduce((acc, segment, idx) => {
              const prevPercentage = chartData.segments
                .slice(0, idx)
                .reduce((sum, s) => sum + parseFloat(s.percentage), 0)
              
              const startAngle = (prevPercentage / 100) * 360
              const endAngle = startAngle + (parseFloat(segment.percentage) / 100) * 360
              
              const startRad = (startAngle * Math.PI) / 180
              const endRad = (endAngle * Math.PI) / 180
              
              const x1 = 50 + 40 * Math.cos(startRad)
              const y1 = 50 + 40 * Math.sin(startRad)
              const x2 = 50 + 40 * Math.cos(endRad)
              const y2 = 50 + 40 * Math.sin(endRad)
              
              const largeArc = parseFloat(segment.percentage) > 50 ? 1 : 0
              
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ')
              
              return [
                ...acc,
                <path
                  key={idx}
                  d={pathData}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ]
            }, [] as ReactElement[])}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold">{chartData.total}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {chartData.segments.map((segment, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: segment.color }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{segment.label}</p>
                <p className="text-xs text-muted-foreground">
                  {segment.value} items ({segment.percentage}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {chartData.segments.map((segment, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{segment.label}</span>
                <span className="text-sm font-semibold">{segment.percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${segment.percentage}%`,
                    backgroundColor: segment.color
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{segment.value} items</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
