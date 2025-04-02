import type React from "react"
import { ThemeProvider } from "@/providers/ThemeProvider"

export default function MarketingLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    )
}

