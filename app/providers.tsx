"use client"

import React from "react"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/context/AuthContext"
import { ToastProvider } from "@/context/ToastContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

interface ProvidersProps {
    children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <AuthProvider>
                    <ToastProvider>{children}</ToastProvider>
                </AuthProvider>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}

