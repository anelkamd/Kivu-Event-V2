import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kivu Event - Gestion d'événements d'entreprise",
  description:
      "Plateforme de gestion des événements d'entreprise - Organisation des séminaires, conférences, et suivi des participants",
}

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
      </body>
      </html>
  )
}

