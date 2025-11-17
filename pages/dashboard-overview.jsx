import Head from 'next/head'
import DashboardLayout from '@/components/dashboard/common/Dashboard-Layout'
import DashboardOverviewPage from '@/components/dashboard/dahboard-overview/DashboardOverviewPage'
import ProtectedRoute from '@/pages/auth/ProtectedRoute'

export default function DashboardOverview() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard Overview - FoodDash</title>
      </Head>
      <DashboardLayout headerPlaceholder="Search products...">
        <DashboardOverviewPage />
      </DashboardLayout>
    </ProtectedRoute>
  )
}

