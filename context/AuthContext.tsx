"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import axios from "@/lib/axios"
import type { User } from "@/types"
import toast from "react-hot-toast"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const token = Cookies.get("token")
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/auth/me")
      setUser(data.data)
    } catch (error) {
      Cookies.remove("token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data } = await axios.post("/auth/login", { email, password })

      Cookies.set("token", data.token, { expires: 30 })
      setUser(data.data)

      toast.success("Connexion réussie!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur de connexion")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      // Rediriger vers l'URL d'authentification Google
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur de connexion avec Google")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true)
      const { data } = await axios.post("/auth/register", userData)

      Cookies.set("token", data.token, { expires: 30 })
      setUser(data.data)

      toast.success("Inscription réussie!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur d'inscription")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    Cookies.remove("token")
    setUser(null)
    router.push("/")
    toast.success("Déconnexion réussie!")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

