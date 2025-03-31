import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value || ""
    const path = request.nextUrl.pathname

    // Routes qui nécessitent une authentification
    const protectedRoutes = ["/dashboard", "/events/create", "/profile"]

    // Routes accessibles uniquement aux utilisateurs non authentifiés
    const authRoutes = ["/login", "/register"]

    // Vérifier si l'utilisateur essaie d'accéder à une route protégée sans être authentifié
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
    const isAuthRoute = authRoutes.includes(path)

    console.log(`Middleware checking path: ${path}, token: ${token ? "exists" : "missing"}`)
    console.log(`isProtectedRoute: ${isProtectedRoute}, isAuthRoute: ${isAuthRoute}`)

    // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
    if (isProtectedRoute && !token) {
        console.log("Redirecting to login")
        const url = new URL("/login", request.url)
        url.searchParams.set("callbackUrl", encodeURI(path))
        return NextResponse.redirect(url)
    }

    // Si l'utilisateur est authentifié et essaie d'accéder à une route d'authentification
    if (isAuthRoute && token) {
        console.log("Redirecting to dashboard")
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

// Configurer les chemins sur lesquels le middleware s'exécute
export const config = {
    matcher: ["/dashboard/:path*", "/events/create/:path*", "/profile/:path*", "/login", "/register"],
}

