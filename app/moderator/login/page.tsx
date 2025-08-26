"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield, CheckCircle } from "lucide-react"

export default function ModeratorLogin() {
  const [error, setError] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "auth_failed":
          setError("Échec de l'authentification. Veuillez réessayer.")
          break
        case "invalid_invitation":
          setError("Lien d'invitation invalide ou expiré.")
          break
        case "activation_failed":
          setError("Erreur lors de l'activation de votre compte.")
          break
        default:
          setError("Une erreur est survenue lors de la connexion.")
      }
    }
  }, [searchParams])

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/moderator/google"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Connexion Modérateur</CardTitle>
          <CardDescription>Accédez à votre espace de modération avec Google</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Accès réservé aux modérateurs invités
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Vous devez avoir reçu une invitation par email</li>
                <li>• Utilisez le compte Google associé à votre invitation</li>
                <li>• Votre accès sera automatiquement configuré</li>
              </ul>
            </div>

            <Button
              onClick={handleGoogleLogin}
              className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              size="lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Se connecter avec Google
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Vous n'avez pas reçu d'invitation ?</p>
            <p className="mt-1">Contactez l'organisateur de votre événement</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
