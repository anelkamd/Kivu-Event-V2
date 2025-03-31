"use client"

import type React from "react"

import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import  Sidebar  from "@/components/dashboard/DashboardSidebar"

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
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 p-6 md:p-8">{children}</div>
      </div>
  )
}

