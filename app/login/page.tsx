"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import { FcGoogle } from "react-icons/fc"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import {Button} from "@/components/ui/button";
import {ArrowLeftIcon, ArrowRightIcon} from "lucide-react";

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const { login, loginWithGoogle, loading: authLoading, error: authError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError("")
    try {
      await login(data.email, data.password)
      // La redirection sera gérée par la fonction login
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error?.response?.data?.error || "Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error("Google login error:", error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-md">
          <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-white">Bienvenue</h2>
            <p className="mt-2 text-gray-400">
              Connectez-vous pour accéder à votre compte
            </p>
          </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-900 rounded-2xl p-8 shadow-xl"
          >
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3 px-4 rounded-xl font-medium transition-all hover:bg-gray-100 mb-6"
            >
              <FcGoogle className="h-5 w-5" />
              {isGoogleLoading ? "Connexion en cours..." : "Continuer avec Google"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">
                Ou connectez-vous avec votre email
              </span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Adresse email
                </label>
                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`w-full bg-gray-800 border ${
                        errors.email ? "border-red-500" : "border-gray-700"
                    } rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-white/25 transition-all`}
                    {...register("email", {
                      required: "L'email est requis",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Adresse email invalide",
                      },
                    })}
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className={`w-full bg-gray-800 border ${
                          errors.password ? "border-red-500" : "border-gray-700"
                      } rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-white/25 transition-all`}
                      {...register("password", {
                        required: "Le mot de passe est requis",
                        minLength: {
                          value: 6,
                          message: "Le mot de passe doit contenir au moins 6 caractères",
                        },
                      })}
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                        <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded bg-gray-800 border-gray-700 text-white focus:ring-white/25"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-white hover:text-gray-300">
                    Mot de passe oublié?
                  </Link>
                </div>
              </div>

              {(error || authError) && (
                  <div className="text-sm text-red-500 mt-2">{error || authError}</div>
              )}

              <button
                  type="submit"
                  disabled={isLoading || authLoading}
                  className="w-full bg-white text-black font-medium py-3 px-4 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </span>
                ) : (
                    "Se connecter"
                )}
              </button>
              <Link href="/">
                <Button variant="secondary" className="w-full bg-white text-black font-medium py-3 px-4 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                  Retour <ArrowLeftIcon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Vous n'avez pas de compte?{" "}
              <Link href="/register" className="font-medium text-white hover:text-gray-300">
                Inscrivez-vous
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
  )
}