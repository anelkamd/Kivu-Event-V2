"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Home, User, Settings } from "lucide-react"
import { Sidebar } from "@/components/dashboard/DashboardSidebar"
import {
  SidebarProvider,
} from "@/components/ui/sidebar"

interface EventsLayoutProps {
  children: ReactNode
}

export default function EventsLayout({ children }: EventsLayoutProps) {

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
