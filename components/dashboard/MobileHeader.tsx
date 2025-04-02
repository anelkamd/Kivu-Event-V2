"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Search, X, LayoutDashboard, Inbox, Calendar, Users, Settings, LogOut, Moon, Sun, MapPin, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"

export function MobileHeader() {
    const { user, logout } = useAuth()
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const [isSearchOpen, setIsSearchOpen] = useState(false)
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
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background">
            <div className="flex items-center">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-border flex items-center">
                                <Link href="/dashboard" className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-black text-white dark:bg-white dark:text-black font-bold">
                                        KE
                                    </div>
                                    <span className="font-semibold text-lg">Kivu Event</span>
                                </Link>
                            </div>

                            <div className="flex-1 p-4 overflow-auto">
                                <nav className="space-y-1">
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

                                    {/* Bouton pour basculer entre le mode clair et sombre */}
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
                            </div>

                            <div className="border-t border-border p-4">
                                <div className="flex items-center mb-4">
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
                                </div>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={logout}
                                    className="w-full"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Déconnexion
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
                <Link href="/dashboard" className="flex items-center ml-2">
                    <span className="font-semibold text-lg">Kivu Event</span>
                </Link>
            </div>

            <div className="flex items-center space-x-2">
                {isSearchOpen ? (
                    <div className="absolute left-0 top-0 w-full p-2 bg-background z-10 border-b border-border flex">
                        <Input
                            placeholder="Rechercher..."
                            className="flex-1"
                            autoFocus
                        />
                        <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                            <Search className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")}>
                            {isDark ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}
