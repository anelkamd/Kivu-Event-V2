"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "@/lib/axios"
import { useToast } from "@/hooks/use-toast"

// Définir les types
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  profileImage?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token")
        console.log("Checking authentication with token:", token ? "exists" : "missing")

        if (!token) {
          console.log("No token found, user not authenticated")
          setLoading(false)
          return
        }

        const res = await axios.get("/api/auth/me")
        console.log("Authentication check response:", res.data)

        if (res.data.success) {
          console.log("User authenticated successfully:", res.data.data)
          setUser(res.data.data)
        }
      } catch (error: any) {
        console.error("Authentication check failed:", error)
        localStorage.removeItem("token")
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUserLoggedIn()
  }, [])

  // Enregistrer un utilisateur
  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const res = await axios.post("/api/auth/register", {
        firstName,
        lastName,
        email,
        password,
      })

      if (res.data.success) {
        localStorage.setItem("token", res.data.token)
        document.cookie = `token=${res.data.token}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 jours
        setUser(res.data.data)
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès.",
        })

        // Utiliser window.location.href pour une redirection complète
        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      setError(error.response?.data?.error || "Une erreur s'est produite lors de l'inscription.")
      toast({
        title: "Erreur d'inscription",
        description: error.response?.data?.error || "Une erreur s'est produite lors de l'inscription.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Connecter un utilisateur
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log("Tentative de connexion avec:", { email, password: "***" })

      const res = await axios.post("/api/auth/login", {
        email,
        password,
      })

      console.log("Réponse de connexion:", res.data)

      if (res.data.success) {
        // Stocker le token à la fois dans localStorage et dans un cookie
        localStorage.setItem("token", res.data.token)
        document.cookie = `token=${res.data.token}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 jours

        setUser(res.data.data)
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        })

        console.log("Redirection vers /dashboard")

        // Forcer la navigation avec window.location au lieu de router.push
        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error)
      setError(error.response?.data?.error || "Une erreur s'est produite lors de la connexion.")
      toast({
        title: "Erreur de connexion",
        description: error.response?.data?.error || "Une erreur s'est produite lors de la connexion.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Connecter avec Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)

      // Implémentez ici la logique de connexion avec Google
      // Après une connexion réussie, utilisez window.location.href pour rediriger

      toast({
        title: "Fonctionnalité en développement",
        description: "La connexion avec Google sera bientôt disponible.",
      })
    } catch (error: any) {
      console.error("Erreur de connexion Google:", error)
      setError(error.response?.data?.error || "Une erreur s'est produite lors de la connexion avec Google.")
      toast({
        title: "Erreur de connexion",
        description: error.response?.data?.error || "Une erreur s'est produite lors de la connexion avec Google.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Déconnecter un utilisateur
  const logout = () => {
    localStorage.removeItem("token")
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    setUser(null)

    // Utiliser window.location.href pour une redirection complète
    window.location.href = "/login"

    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès.",
    })
  }

  // Effacer les erreurs
  const clearError = () => {
    setError(null)
  }

  return (
      <AuthContext.Provider
          value={{
            user,
            loading,
            error,
            register,
            login,
            loginWithGoogle,
            logout,
            clearError,
          }}
      >
        {children}
      </AuthContext.Provider>
  )
}

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }
  return context
}

