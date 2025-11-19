'use client'

import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import SafeIcon from '@/components/dashboard/common/SafeIcon'
import { useAuth } from '@/hooks/useAuth'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard-overview', icon: 'LayoutDashboard' },
  { name: 'Products', href: '/product-management', icon: 'Package' },
  { name: 'Catalog', href: '/catalog', icon: 'ShoppingBag' },
  { name: 'Checkout', href: '/checkout/catalog', icon: 'CreditCard' },
  { name: 'Analytics', href: '/report-analytics', icon: 'BarChart3' },
  { name: 'User Profile', href: '/user-profile', icon: 'UserRound' },
]

function getInitials(name?: string) {
  if (!name) return '??'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  const initials = parts
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return initials || '??'
}

export default function DashboardSidebar() {
  const { user } = useAuth(false)
  const avatarUrl = user?.name
    ? `https://ui-avatars.com/api/?background=1d4ed8&color=fff&name=${encodeURIComponent(
        user.name,
      )}`
    : 'https://ui-avatars.com/api/?background=1d4ed8&color=fff&name=User'

  return (
    <Sidebar variant="inset" className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <SafeIcon name="UtensilsCrossed" className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Kasir Pintar</h1>
            <p className="text-xs text-muted-foreground"></p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href} className="flex items-center gap-3">
                      <SafeIcon name={item.icon} className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Link
          href="/user-profile"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={avatarUrl}
              alt="User avatar"
            />
            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || 'Manage account'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'View profile'}
            </p>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
