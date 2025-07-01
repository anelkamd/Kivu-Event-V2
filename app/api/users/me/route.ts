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
    console.log("Décodage du token avec secret:", jwtSecret ? "✓" : "✗")

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload
    console.log("Token décodé:", {
      userId: decoded.userId,
      id: decoded.id,
      sub: decoded.sub,
      email: decoded.email,
    })

    // Essayer différentes propriétés pour l'ID utilisateur
    const userId = decoded.userId || decoded.id || decoded.sub
    console.log("ID utilisateur extrait:", userId)

    return userId || null
  } catch (error) {
    console.error("Erreur de décodage du token:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== Début de GET /api/users/me ===")

    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = request.headers.get("authorization")
    console.log("En-tête Authorization:", authHeader ? "présent" : "absent")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Token manquant ou format incorrect")
      return NextResponse.json(
        {
          success: false,
          message: "Token d'authentification manquant",
        },
        { status: 401 },
      )
    }

    const token = authHeader.substring(7) // Enlever "Bearer "
    console.log("Token extrait:", token.substring(0, 20) + "...")

    const userId = getUserIdFromToken(token)

    if (!userId) {
      console.log("Impossible d'extraire l'ID utilisateur du token")
      return NextResponse.json(
        {
          success: false,
          message: "Token invalide",
        },
        { status: 401 },
      )
    }

    console.log("Recherche de l'utilisateur avec ID:", userId)

    // Vérifier la connexion à la base de données
    try {
      await pool.execute("SELECT 1")
      console.log("Connexion à la base de données: ✓")
    } catch (dbError) {
      console.error("Erreur de connexion à la base de données:", dbError)
      return NextResponse.json(
        {
          success: false,
          message: "Erreur de connexion à la base de données",
        },
        { status: 500 },
      )
    }

    // Récupérer les informations de l'utilisateur depuis la base de données
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        phone_number as phone, 
        company, 
        job_title, 
        profile_image, 
        role,
        created_at,
        updated_at
      FROM users 
      WHERE id = ?`,
      [userId],
    )

    const users = rows as any[]
    console.log("Nombre d'utilisateurs trouvés:", users.length)

    if (users.length === 0) {
      console.log("Aucun utilisateur trouvé avec l'ID:", userId)

      // Vérifier si l'utilisateur existe avec un autre ID
      const [allUsers] = await pool.execute("SELECT id, email FROM users LIMIT 5")
      console.log("Premiers utilisateurs dans la base:", allUsers)

      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur non trouvé dans la base de données",
          debug: {
            searchedUserId: userId,
            usersInDatabase: allUsers,
          },
        },
        { status: 404 },
      )
    }

    const user = users[0]
    console.log("Utilisateur trouvé:", {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    })

    return NextResponse.json({
      success: true,
      message: "Données utilisateur récupérées avec succès",
      data: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        job_title: user.job_title,
        profile_image: user.profile_image,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("=== Début de PUT /api/users/me ===")

    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Token d'authentification manquant",
        },
        { status: 401 },
      )
    }

    const token = authHeader.substring(7)
    const userId = getUserIdFromToken(token)

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Token invalide",
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { first_name, last_name, email, phone, company, job_title } = body

    console.log("Mise à jour du profil pour l'utilisateur:", userId, {
      first_name,
      last_name,
      email,
      phone,
      company,
      job_title,
    })

    // Validation basique
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Le prénom, nom et email sont requis",
        },
        { status: 400 },
      )
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ? AND id != ?", [email, userId])

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cet email est déjà utilisé par un autre utilisateur",
        },
        { status: 400 },
      )
    }

    // Mettre à jour l'utilisateur
    await pool.execute(
      `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, phone_number = ?, company = ?, job_title = ?, updated_at = NOW()
       WHERE id = ?`,
      [first_name, last_name, email, phone || null, company || null, job_title || null, userId],
    )

    // Récupérer les données mises à jour
    const [updatedRows] = await pool.execute(
      `SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        phone_number as phone, 
        company, 
        job_title, 
        profile_image, 
        role,
        created_at,
        updated_at
      FROM users 
      WHERE id = ?`,
      [userId],
    )

    const updatedUser = (updatedRows as any[])[0]

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Profil mis à jour avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
