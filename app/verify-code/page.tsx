"use client"

import type React from "react"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Shield, Loader2, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

function VerifyCodeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes en secondes
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const email = searchParams.get("email") || ""

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isComplete = code.every((digit) => digit !== "")
  const codeString = code.join("")

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value)) && value !== "") return

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Prendre seulement le dernier caractère

    setCode(newCode)

    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newCode = [...code]

    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || ""
    }

    setCode(newCode)

    // Focus sur le dernier champ rempli ou le premier vide
    const lastFilledIndex = pastedData.length - 1
    if (lastFilledIndex >= 0 && lastFilledIndex < 5) {
      inputsRef.current[lastFilledIndex + 1]?.focus()
    }
  }

  const handleSubmit = async () => {
    if (!isComplete) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: codeString,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Code vérifié",
          description: "Code de vérification correct",
        })

        // Rediriger vers la page de réinitialisation avec le token
        router.push(`/reset-password?token=${result.token}&email=${encodeURIComponent(email)}`)
      } else {
        toast({
          title: "Code incorrect",
          description: result.error || "Le code de vérification est incorrect ou expiré",
          variant: "destructive",
        })

        // Réinitialiser le code en cas d'erreur
        setCode(["", "", "", "", "", ""])
        inputsRef.current[0]?.focus()
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Code renvoyé",
          description: "Un nouveau code de vérification a été envoyé",
        })
        setTimeLeft(600) // Réinitialiser le timer
        setCode(["", "", "", "", "", ""]) // Réinitialiser le code
        inputsRef.current[0]?.focus()
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de renvoyer le code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer le code",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Email manquant</h2>
            <p className="text-muted-foreground mb-4">Aucune adresse email n'a été fournie.</p>
            <Link href="/forgot-password">
              <Button>Retour</Button>
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
            <CardContent className="p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold">Code de vérification</h1>
                  <p className="text-balance text-muted-foreground">
                    Nous avons envoyé un code à <span className="font-medium">{email}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center gap-2" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                      <motion.input
                        key={index}
                        ref={(el) => (inputsRef.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={cn(
                          "w-12 h-12 text-center text-xl font-semibold border rounded-lg",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                          "transition-all duration-200",
                          digit && "border-blue-500 bg-blue-50",
                          !digit && "border-gray-300",
                        )}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Temps restant: <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
                    </p>
                  </div>

                  <Button onClick={handleSubmit} className="w-full" disabled={!isComplete || isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      "Vérifier le code"
                    )}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Vous n'avez pas reçu le code ?</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendCode}
                      disabled={isResending || timeLeft > 540} // Désactiver pendant les 60 premières secondes
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Renvoyer le code
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Link
                      href="/forgot-password"
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Changer d'adresse email
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

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VerifyCodeContent />
    </Suspense>
  )
}
