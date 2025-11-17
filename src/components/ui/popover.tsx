"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Stub implementations for popover components
// These are not currently used in the application

interface PopoverProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  [key: string]: any
}

const Popover = ({ children, ...props }: PopoverProps) => {
  return <>{children}</>
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button ref={ref} className={className} {...props} />
))
PopoverTrigger.displayName = "PopoverTrigger"

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
  sideOffset?: number
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "center", sideOffset = 4, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        className
      )}
      style={{
        marginTop: sideOffset,
      }}
      {...props}
    />
  )
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
