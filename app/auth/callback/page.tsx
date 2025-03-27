"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from "js-cookie"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

export default function AuthCallback() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    useEffect(() => {
        if (token) {
            // Stocker le token dans un cookie
            Cookies.set("token", token, { expires: 30 })

            // Rediriger vers le tableau de bord
            router.push("/dashboard")
        } else {
            // Rediriger vers la page de connexion en cas d'erreur
            router.push("/login?error=auth_failed")
        }
    }, [token, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-white">Authentification en cours...</p>
            </div>
        </div>
    )
}