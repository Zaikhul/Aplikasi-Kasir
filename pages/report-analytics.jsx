import Head from 'next/head'
import DashboardLayout from '@/components/dashboard/common/Dashboard-Layout'
import ReportAnalyticsPage from '@/components/dashboard/report-analytics/ReportAnalyticsPage'
import ProtectedRoute from '@/pages/auth/ProtectedRoute'

export default function ReportAnalytics() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Reporting & Analytics - FoodDash</title>
      </Head>
      <DashboardLayout headerPlaceholder="Search analytics...">
        <ReportAnalyticsPage />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

