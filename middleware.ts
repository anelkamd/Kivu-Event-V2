import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    // Journaliser les requêtes API pour le débogage
    if (request.nextUrl.pathname.startsWith("/api/")) {
        console.log(`[Middleware] Requête API: ${request.method} ${request.nextUrl.pathname}`)

        // Afficher les en-têtes pour le débogage
        const headers = Array.from(request.headers.entries())
        console.log("[Middleware] En-têtes de la requête:", headers)

        // Afficher les cookies pour le débogage
        const cookies = request.cookies.getAll()
        console.log("[Middleware] Cookies de la requête:", cookies)
    }

    // Vérifier si la route est protégée
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/profile")

    // Vérifier si la route est une route d'authentification
    const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register")

    // Vérifier si l'utilisateur est authentifié
    const token = request.cookies.get("token")?.value

    console.log(`Middleware checking path: ${request.nextUrl.pathname}, token: ${token ? "exists" : "missing"}`)
    console.log(`isProtectedRoute: ${isProtectedRoute}, isAuthRoute: ${isAuthRoute}`)

    // Si c'est une route protégée et que l'utilisateur n'est pas authentifié
    if (isProtectedRoute && !token) {
        console.log("Redirection vers la page de connexion")
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // Si c'est une route d'authentification et que l'utilisateur est déjà authentifié
    if (isAuthRoute && token) {
        console.log("Redirection vers le tableau de bord")
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

// Exécuter le middleware sur toutes les routes
export const config = {
    matcher: ["/api/:path*", "/dashboard/:path*", "/profile/:path*", "/login", "/register"],
}
