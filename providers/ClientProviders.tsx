"use client"

import { ReactNode } from "react"
import { AuthProvider } from "@/context/AuthContext"
import ReactQueryProvider from "@/providers/ReactQueryProvider"
import { ThemeProvider } from "@/providers/ThemeProvider"

export default function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <ReactQueryProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </ThemeProvider>
        </ReactQueryProvider>
    )
}