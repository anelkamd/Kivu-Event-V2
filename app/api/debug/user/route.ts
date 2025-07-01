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

export async function GET(request: NextRequest) {
  try {
    console.log("=== API Debug User ===")

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      debug: {
        token: {
          present: false,
          valid: false,
          extractedUserId: null,
        },
        database: {
          connected: false,
          userCount: 0,
          users: [],
        },
        currentUser: null,
      },
    }

    // Vérifier le token
    const authHeader = request.headers.get("authorization")
    debugInfo.debug.token.present = !!authHeader

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)

      try {
        const jwtSecret = process.env.JWT_SECRET || "default_secret_key"
        const decoded = jwt.verify(token, jwtSecret) as JWTPayload
        debugInfo.debug.token.valid = true
        debugInfo.debug.token.extractedUserId = decoded.userId || decoded.id || decoded.sub
        debugInfo.debug.token.decodedPayload = {
          userId: decoded.userId,
          id: decoded.id,
          sub: decoded.sub,
          email: decoded.email,
        }
      } catch (jwtError) {
        debugInfo.debug.token.error = jwtError instanceof Error ? jwtError.message : "Erreur JWT"
      }
    }

    // Vérifier la base de données
    try {
      await pool.execute("SELECT 1")
      debugInfo.debug.database.connected = true

      // Compter les utilisateurs
      const [countResult] = await pool.execute("SELECT COUNT(*) as count FROM users")
      debugInfo.debug.database.userCount = (countResult as any[])[0].count

      // Récupérer quelques utilisateurs pour debug
      const [usersResult] = await pool.execute("SELECT id, email, first_name, last_name FROM users LIMIT 5")
      debugInfo.debug.database.users = usersResult

      // Si on a un userId valide, chercher l'utilisateur actuel
      if (debugInfo.debug.token.extractedUserId) {
        const [currentUserResult] = await pool.execute(
          "SELECT id, email, first_name, last_name FROM users WHERE id = ?",
          [debugInfo.debug.token.extractedUserId],
        )
        debugInfo.debug.currentUser = (currentUserResult as any[])[0] || null
      }
    } catch (dbError) {
      debugInfo.debug.database.error = dbError instanceof Error ? dbError.message : "Erreur DB"
    }

    return NextResponse.json({
      success: true,
      message: "Informations de debug récupérées",
      ...debugInfo,
    })
  } catch (error) {
    console.error("Erreur dans l'API debug:", error)
    return NextResponse.json({
      success: false,
      message: "Erreur lors de la récupération des informations de debug",
      error: error instanceof Error ? error.message : "Erreur inconnue",
    })
  }
}
