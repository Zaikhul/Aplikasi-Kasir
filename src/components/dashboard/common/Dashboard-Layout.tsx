'use client'

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import DashboardSidebar from '@/components/dashboard/common/Dashboard-Sidebar'
import DashboardHeader from '@/components/dashboard/common/Dashboard-Header'

interface DashboardLayoutProps {
  children: React.ReactNode
  headerPlaceholder?: string
  onSearch?: (query: string) => void
}

export default function DashboardLayout({ 
  children, 
  headerPlaceholder = 'Search products...',
  onSearch
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <DashboardHeader 
          placeholder={headerPlaceholder}
          onSearch={onSearch}
        />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
