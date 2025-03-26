"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: HomeIcon },
  { name: "Événements", href: "/dashboard/events", icon: CalendarIcon },
  { name: "Participants", href: "/dashboard/participants", icon: UserGroupIcon },
  { name: "Lieux", href: "/dashboard/venues", icon: BuildingOfficeIcon },
  { name: "Profil", href: "/dashboard/profile", icon: UserIcon },
  { name: "Paramètres", href: "/dashboard/settings", icon: Cog6ToothIcon },
]

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-bold text-primary"
            >
              Kivu Event
            </motion.span>
          )}
          <button
            type="button"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  pathname === item.href
                    ? "bg-gray-100 dark:bg-gray-700 text-primary"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary",
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                )}
              >
                <item.icon
                  className={cn(
                    pathname === item.href ? "text-primary" : "text-gray-400 group-hover:text-primary",
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  )}
                  aria-hidden="true"
                />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div
              className={cn(
                "h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center",
                !collapsed && "mr-3",
              )}
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
              </div>
            )}
            <button
              onClick={logout}
              className="ml-auto flex-shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              title="Déconnexion"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

