"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { Toaster } from "@/components/ui/toaster"

type ToastContextType = {}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ToastContext.Provider value={{}}>
            {children}
            <Toaster />
        </ToastContext.Provider>
    )
}

export const useToastContext = () => {
    const context = useContext(ToastContext)
    if (context === undefined) {
        throw new Error("useToastContext doit être utilisé à l'intérieur d'un ToastProvider")
    }
    return context
}

