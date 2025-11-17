'use client'

import Link from 'next/link'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import SafeIcon from '@/components/dashboard/common/SafeIcon'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard-overview', icon: 'LayoutDashboard' },
  { name: 'Products', href: '/product-management', icon: 'Package' },
  { name: 'Analytics', href: '/report-analytics', icon: 'BarChart3' },
  { name: 'Settings', href: '/dashboard-settings', icon: 'Settings' },
]

export default function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <SafeIcon name="Menu" className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <SafeIcon name="UtensilsCrossed" className="w-6 h-6 text-primary-foreground" />
            </div>
            <span>FoodDash</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <SafeIcon name={item.icon} className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        <Separator className="my-6" />

        <Link href="/user-profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/15/c0945ebd-bfe2-4bca-bbc7-1699c6d4ef91.png" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">john.doe@example.com</p>
          </div>
        </Link>
      </SheetContent>
    </Sheet>
  )
}
