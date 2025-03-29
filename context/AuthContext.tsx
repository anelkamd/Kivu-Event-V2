"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
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
  logout: () => void
  clearError: () => void
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// URL de l'API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          setLoading(false)
          return
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }

        const res = await axios.get(`${API_URL}/api/auth/me`, config)

        if (res.data.success) {
          setUser(res.data.data)
        }
      } catch (error) {
        localStorage.removeItem("token")
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

      const res = await axios.post(`${API_URL}/api/auth/register`, {
        firstName,
        lastName,
        email,
        password,
      })

      if (res.data.success) {
        localStorage.setItem("token", res.data.token)
        setUser(res.data.data)
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès.",
        })
        router.push("/dashboard")
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

      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      })

      if (res.data.success) {
        localStorage.setItem("token", res.data.token)
        setUser(res.data.data)
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        })
        router.push("/dashboard")
      }
    } catch (error: any) {
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

  // Déconnecter un utilisateur
  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    router.push("/login")
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

