"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Lock, Loader2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type FormData = {
  password: string
  confirmPassword: string
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>()

  const password = watch("password", "")

  const onSubmit = async (data: FormData) => {
    if (!token || !email) {
      toast({
        title: "Erreur",
        description: "Token ou email manquant",
        variant: "destructive",
      })
      router.push("/forgot-password")
      return
    }

    setIsLoading(true)
    try {
      console.log("Envoi des données:", { token, email, password: data.password })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password: data.password,
        }),
      })

      const result = await response.json()
      console.log("Réponse du serveur:", result)

      if (response.ok && result.success) {
        toast({
          title: "Succès",
          description: "Votre mot de passe a été réinitialisé avec succès",
        })

        // Rediriger vers la page de connexion
        router.push("/login")
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de réinitialiser le mot de passe",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de se connecter au serveur",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Lien invalide</h2>
            <p className="text-muted-foreground mb-4">Le lien de réinitialisation est invalide ou a expiré.</p>
            <Link href="/forgot-password">
              <Button>Demander un nouveau lien</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <Lock className="h-6 w-6 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
                    <p className="text-balance text-muted-foreground">
                      Choisissez un nouveau mot de passe sécurisé pour votre compte
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Entrez votre nouveau mot de passe"
                          {...register("password", {
                            required: "Le mot de passe est requis",
                            minLength: {
                              value: 8,
                              message: "Le mot de passe doit contenir au moins 8 caractères",
                            },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                              message:
                                "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre",
                            },
                          })}
                          className={cn(errors.password && "border-red-500")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirmez votre nouveau mot de passe"
                          {...register("confirmPassword", {
                            required: "Veuillez confirmer votre mot de passe",
                            validate: (value) => value === password || "Les mots de passe ne correspondent pas",
                          })}
                          className={cn(errors.confirmPassword && "border-red-500")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Conseils pour un mot de passe sécurisé :</strong>
                      </p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• Au moins 8 caractères</li>
                        <li>• Une lettre majuscule et une minuscule</li>
                        <li>• Au moins un chiffre</li>
                        <li>• Évitez les mots courants</li>
                      </ul>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Réinitialisation...
                        </>
                      ) : (
                        "Réinitialiser le mot de passe"
                      )}
                    </Button>
                  </form>

                  <div className="text-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour à la connexion
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
