import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import pool from "@/lib/db"

// Interface pour le payload JWT
interface JWTPayload {
  userId?: string
  id?: string
  sub?: string
  email?: string
  role?: string
  iat?: number
  exp?: number
}

// Fonction utilitaire pour extraire l'ID utilisateur du token
function getUserIdFromToken(token: string): string | null {
  try {
    const jwtSecret = process.env.JWT_SECRET || "default_secret_key"
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload
    return decoded.userId || decoded.id || decoded.sub || null
  } catch (error) {
    console.error("Erreur de décodage du token:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== API Auth Me ===")

    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = request.headers.get("authorization")
    console.log("En-tête Authorization:", authHeader ? "présent" : "absent")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Token manquant")
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: "Token d'authentification manquant",
      })
    }

    const token = authHeader.substring(7)
    console.log("Token extrait:", token.substring(0, 20) + "...")

    const userId = getUserIdFromToken(token)
    console.log("ID utilisateur extrait:", userId)

    if (!userId) {
      console.log("Token invalide")
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: "Token invalide",
      })
    }

    // Vérifier que l'utilisateur existe en base
    try {
      const [rows] = await pool.execute("SELECT id, email, first_name, last_name FROM users WHERE id = ?", [userId])
      const users = rows as any[]

      if (users.length === 0) {
        console.log("Utilisateur non trouvé en base")
        return NextResponse.json({
          success: false,
          authenticated: false,
          message: "Utilisateur non trouvé",
        })
      }

      const user = users[0]
      console.log("Utilisateur authentifié:", user.email)

      return NextResponse.json({
        success: true,
        authenticated: true,
        message: "Utilisateur authentifié",
        data: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      })
    } catch (dbError) {
      console.error("Erreur base de données:", dbError)
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: "Erreur de base de données",
      })
    }
  } catch (error) {
    console.error("Erreur dans l'API auth/me:", error)
    return NextResponse.json({
      success: false,
      authenticated: false,
      message: "Erreur serveur",
    })
  }
}
