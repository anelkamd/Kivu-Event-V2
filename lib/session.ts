import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key"

interface SessionUser {
    id: string
    email: string
    role?: string
}

interface Session {
    user: SessionUser
}

export async function getSession(request: NextRequest): Promise<Session | null> {
    try {
        let finalToken: string | null = null

        // Essayer d'obtenir le token depuis l'en-tête Authorization
        const authHeader = request.headers.get("Authorization")
        if (authHeader?.startsWith("Bearer ")) {
            finalToken = authHeader.substring(7)
        }

        // Si pas de token dans l'en-tête, essayer depuis les cookies
        if (!finalToken) {
            try {
                const cookieStore = await cookies()
                finalToken = cookieStore.get("token")?.value || null
            } catch (e) {
                console.error("Error accessing cookies:", e)
            }
        }

        if (!finalToken) {
            console.log("No token found in headers or cookies")
            return null
        }

        console.log("Token found, verifying...")

        // Vérifier et décoder le token
        const decoded = jwt.verify(finalToken, JWT_SECRET) as any
        console.log("Decoded token:", decoded)

        // Vérifier la structure du token décodé
        if (!decoded) {
            return null
        }

        // Adapter selon la structure réelle de votre token
        const userId = decoded.userId || decoded.id || decoded.sub
        const email = decoded.email
        const role = decoded.role

        if (!userId) {
            console.log("No userId found in token")
            return null
        }

        console.log("Session created for user:", userId)
        return {
            user: {
                id: userId,
                email: email || "",
                role: role,
            },
        }
    } catch (error) {
        console.error("Error getting session:", error)
        return null
    }
}

// Version qui fonctionne pour les routes d'API
export async function getSessionFromCookies(): Promise<Session | null> {
    try {
        let token: string | null = null

        try {
            const cookieStore = await cookies()
            token = cookieStore.get("token")?.value || null
        } catch (e) {
            console.error("Error accessing cookies:", e)
            return null
        }

        if (!token) {
            return null
        }

        // Vérifier et décoder le token
        const decoded = jwt.verify(token, JWT_SECRET) as any

        // Vérifier la structure du token décodé
        if (!decoded) {
            return null
        }

        // Adapter selon la structure réelle de votre token
        const userId = decoded.userId || decoded.id || decoded.sub
        const email = decoded.email
        const role = decoded.role

        if (!userId) {
            return null
        }

        return {
            user: {
                id: userId,
                email: email || "",
                role: role,
            },
        }
    } catch (error) {
        console.error("Error getting session from cookies:", error)
        return null
    }
}
