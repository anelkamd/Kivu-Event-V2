import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientProviders from "@/providers/ClientProviders" 

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Kivu Event",
    description: "Plateforme de gestion d'événements d'entreprise",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" suppressHydrationWarning>
        <body className={inter.className}>
        <ClientProviders>
            {children}
        </ClientProviders>
        </body>
        </html>
    )
}
