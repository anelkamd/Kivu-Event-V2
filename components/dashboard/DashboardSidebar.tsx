"use client"

import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Inbox, Calendar, Users, Settings, LogOut, Search, MapPin, User, Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const navItems = [
    {
      name: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Messages",
      href: "/dashboard/inbox",
      icon: Inbox,
    },
    {
      name: "Événements",
      href: "/dashboard/events",
      icon: Calendar,
    },
    {
      name: "Participants",
      href: "/dashboard/participants",
      icon: Users,
    },
    {
      name: "Lieux",
      href: "/dashboard/venues",
      icon: MapPin,
    },
  ]

  const settingsItems = [
    {
      name: "Mon profil",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      name: "Paramètres",
      href: "/dashboard/settings",
      icon: Settings,
    }
  ]

  return (
      <div className="hidden md:flex flex-col h-screen w-60 bg-background border-r border-border">
        <div className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-black text-white dark:bg-white dark:text-black font-bold">
              KE
            </div>
            <span className="font-semibold text-lg">Kivu Event</span>
          </Link>
        </div>

        <div className="px-4 hidden lg:block">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Rechercher..."
                className="pl-8 h-9 bg-muted/50 border-0"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between flex-1 p-2 pt-6">
          <nav className="space-y-1.5">
            <div className="px-2 pb-2 text-xs font-medium text-muted-foreground uppercase">
              Navigation
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                  <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                          isActive
                              ? "bg-black/10 text-black dark:bg-white/10 dark:text-white"
                              : "text-muted-foreground hover:bg-muted/60"
                      }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
              )
            })}

            <div className="px-2 pt-4 pb-2 text-xs font-medium text-muted-foreground uppercase">
              Réglages
            </div>
            {settingsItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                  <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                          isActive
                              ? "bg-black/10 text-black dark:bg-white/10 dark:text-white"
                              : "text-muted-foreground hover:bg-muted/60"
                      }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
              )
            })}

            <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="flex w-full items-center px-3 py-2 rounded-md transition-colors text-muted-foreground hover:bg-muted/60"
            >
              {isDark ? (
                  <Sun className="w-5 h-5 mr-3" />
              ) : (
                  <Moon className="w-5 h-5 mr-3" />
              )}
              {isDark ? "Mode clair" : "Mode sombre"}
            </button>
          </nav>

          <div className="mt-auto">
            <div className="border-t border-border pt-4 p-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-black/10 text-black dark:bg-white/10 dark:text-white flex items-center justify-center">
                  {user?.firstName?.charAt(0) || "U"}
                  {user?.lastName?.charAt(0) || ""}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.firstName || "Utilisateur"} {user?.lastName || ""}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="ml-2"
                    title="Déconnexion"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}