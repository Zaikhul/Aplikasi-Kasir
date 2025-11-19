import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/dashboard/common/Dashboard-Layout'
import ProtectedRoute from '@/pages/auth/ProtectedRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import { analyticsApi } from '@/lib/api/analytics.api'
import { exportSalesReportToExcel, getDateRange, type DateRange } from '@/lib/excel-export.service'
import { formatCurrency } from '@/lib/currency'

export default function ReportsExportPage() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Export Reports - Kasir Pintar</title>
      </Head>
      <DashboardLayout headerPlaceholder="Export sales reports">
        <ReportsExportContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

function ReportsExportContent() {
  const router = useRouter()
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'semesterly' | 'yearly' | 'custom'>('monthly')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Set default custom dates to current month
  const getDefaultCustomDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0],
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    setSuccess(null)

    try {
      let dateRange: DateRange

      if (period === 'custom') {
        if (!customStartDate || !customEndDate) {
          setError('Please select both start and end dates for custom range')
          setExporting(false)
          return
        }

        const start = new Date(customStartDate)
        const end = new Date(customEndDate)

        if (start > end) {
          setError('Start date must be before end date')
          setExporting(false)
          return
        }

        dateRange = getDateRange('monthly', start, end) // Use monthly as base, custom dates override
      } else {
        dateRange = getDateRange(period)
      }

      // Fetch detailed report data
      const reportData = await analyticsApi.getDetailedReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })

      // Export to Excel
      await exportSalesReportToExcel(reportData, period, dateRange)

      setSuccess(`Report exported successfully for ${dateRange.label}`)
    } catch (err: any) {
      console.error('Export error:', err)
      setError(err.message || 'Failed to export report. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleBackToReports = () => {
    router.push('/report-analytics')
  }

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Export Sales Report</h1>
        <p className="text-muted-foreground">
          Export detailed sales data and analysis to Excel format.
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <SafeIcon name="CheckCircle" className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <SafeIcon name="AlertCircle" className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Report Settings</CardTitle>
          <CardDescription>
            Select a time period or choose a custom date range for your sales report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Period Selection */}
          <div className="space-y-2">
            <Label htmlFor="period">Time Period</Label>
            <Select
              value={period}
              onValueChange={(value) => {
                setPeriod(value as typeof period)
                if (value === 'custom') {
                  const defaults = getDefaultCustomDates()
                  setCustomStartDate(defaults.start)
                  setCustomEndDate(defaults.end)
                }
              }}
            >
              <SelectTrigger id="period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly (Last 7 Days)</SelectItem>
                <SelectItem value="monthly">Monthly (Current Month)</SelectItem>
                <SelectItem value="semesterly">Semesterly (Current Semester)</SelectItem>
                <SelectItem value="yearly">Yearly (Current Year)</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {period === 'custom' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customStartDate || getDefaultCustomDates().start}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customEndDate || getDefaultCustomDates().end}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Preview Date Range */}
          {period !== 'custom' && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Selected Period:</p>
              <p className="text-sm text-muted-foreground">
                {(() => {
                  const range = getDateRange(period)
                  return `${range.startDate} to ${range.endDate}`
                })()}
              </p>
            </div>
          )}

          {period === 'custom' && customStartDate && customEndDate && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Selected Period:</p>
              <p className="text-sm text-muted-foreground">
                {customStartDate} to {customEndDate}
              </p>
            </div>
          )}

          {/* Report Contents Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm font-medium mb-2 text-blue-900 dark:text-blue-100">
              Report Contents:
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Summary with total orders and revenue</li>
              <li>Product sales with quantities and revenue</li>
              <li>Revenue by category</li>
              <li>Daily sales breakdown</li>
              <li>Detailed orders list</li>
              <li>Order items detail</li>
              <li>Payment method summary</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="w-full"
              size="lg"
            >
              {exporting ? (
                <>
                  <SafeIcon name="Loader" className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <SafeIcon name="Download" className="mr-2 h-4 w-4" />
                  Export to Excel
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToReports}
              disabled={exporting}
            >
              <SafeIcon name="ArrowLeft" className="mr-2 h-4 w-4" />
              Back to Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

