import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export function middleware(request: NextRequest) {
    // Journaliser les requêtes API pour le débogage
    if (request.nextUrl.pathname.startsWith("/api/")) {
        console.log(`[Middleware] Requête API: ${request.method} ${request.nextUrl.pathname}`)

        // Pour les routes API qui nécessitent une authentification
        if (
            request.nextUrl.pathname.startsWith("/api/users/me") ||
            request.nextUrl.pathname.startsWith("/api/dashboard")
        ) {
            // Récupérer le token
            const token =
                request.headers.get("Authorization")?.replace("Bearer ", "") ||
                request.cookies.get("token")?.value

            console.log("[Middleware] Token reçu:", token)

            if (token) {
                try {
                    // Décoder le token pour obtenir l'ID utilisateur
                    const decoded = jwt.verify(
                        token,
                        process.env.JWT_SECRET || "default_secret_key"
                    ) as any

                    console.log("[Middleware] Token décodé:", decoded)

                    const userId = decoded.userId || decoded.id || decoded.sub

                    if (userId) {
                        const requestHeaders = new Headers(request.headers)
                        requestHeaders.set("X-User-ID", userId)

                        console.log("[Middleware] X-User-ID ajouté:", userId)

                        return NextResponse.next({
                            request: {
                                headers: requestHeaders,
                            },
                        })
                    } else {
                        console.warn("[Middleware] Aucun userId trouvé dans le token.")
                    }
                } catch (error) {
                    console.error("[Middleware] Erreur de décodage du token:", error)
                }
            } else {
                console.warn("[Middleware] Aucun token trouvé.")
            }
        }
    }

    return NextResponse.next()
}

// Exécuter le middleware uniquement sur les routes API
export const config = {
    matcher: "/api/:path*",
}