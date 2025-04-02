"use client"

import type React from "react"

import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { Sidebar } from "@/components/dashboard/DashboardSidebar"
import { MobileHeader } from "@/components/dashboard/MobileHeader"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Si l'utilisateur n'est pas connecté et que le chargement est terminé, rediriger vers la page de connexion
        if (!loading && !user) {
            console.log("Utilisateur non authentifié, redirection vers /login")
            router.push("/login")
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!user) {
        return null // Ne rien afficher pendant la redirection
    }

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className={cn("flex min-h-screen bg-background text-foreground")}>
                <Sidebar />
                <div className="flex flex-col flex-1">
                    <MobileHeader />
                    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>
                </div>
            </div>
        </ThemeProvider>
    )
}

