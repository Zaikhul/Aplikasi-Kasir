"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Stub implementations for menubar components
// These are not currently used in the application

const Menubar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-1", className)} {...props} />
))
Menubar.displayName = "Menubar"

const MenubarMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
))
MenubarMenu.displayName = "MenubarMenu"

const MenubarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button ref={ref} className={cn("px-2 py-1", className)} {...props} />
))
MenubarTrigger.displayName = "MenubarTrigger"

const MenubarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("bg-popover p-2", className)} {...props} />
))
MenubarContent.displayName = "MenubarContent"

const MenubarItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-2 py-1 cursor-pointer", className)} {...props} />
))
MenubarItem.displayName = "MenubarItem"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
}
