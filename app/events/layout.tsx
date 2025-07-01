"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Home, User, Settings } from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface EventsLayoutProps {
  children: ReactNode
}

export default function EventsLayout({ children }: EventsLayoutProps) {
  const router = useRouter()

  const navigation = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Événements", href: "/events", icon: CalendarDays },
    { name: "Dashboard", href: "/dashboard", icon: Settings },
    { name: "Profil", href: "/dashboard/profile", icon: User },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar>
          <SidebarHeader className="p-4 font-bold text-lg">Mon App</SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    onClick={() => router.push(item.href)}
                    isActive={item.href === window.location.pathname}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
