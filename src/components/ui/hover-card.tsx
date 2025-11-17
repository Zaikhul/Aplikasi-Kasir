"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface HoverCardProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  [key: string]: any
}

const HoverCard = ({ children, ...props }: HoverCardProps) => {
  return <>{children}</>
}

const HoverCardTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    {children}
  </div>
))
HoverCardTrigger.displayName = "HoverCardTrigger"

interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  sideOffset?: number
}

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  ({ className, align = "center", sideOffset = 4, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        className
      )}
      style={{
        marginTop: sideOffset,
      }}
      {...props}
    />
  )
)
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent }
