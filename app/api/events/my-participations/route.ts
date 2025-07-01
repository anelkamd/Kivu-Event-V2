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
    console.log("=== API My Participations ===")

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

    console.log("Récupération des participations pour l'utilisateur:", userId)

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    try {
      // Récupérer les événements auxquels l'utilisateur participe
      const [rows] = await pool.execute(
        `SELECT 
          e.id,
          e.title,
          e.description,
          e.type,
          e.start_date,
          e.end_date,
          e.capacity,
          e.status,
          e.image,
          e.price,
          p.registration_date,
          COALESCE(pc.participant_count, 0) as participants_count,
          v.name as venue_name,
          v.address as venue_address,
          v.city as venue_city,
          u.first_name as organizer_first_name,
          u.last_name as organizer_last_name,
          u.profile_image as organizer_profile_image
        FROM participants p
        JOIN events e ON p.event_id = e.id
        LEFT JOIN venues v ON e.venue_id = v.id
        LEFT JOIN users u ON e.organizer_id = u.id
        LEFT JOIN (
          SELECT event_id, COUNT(*) as participant_count
          FROM participants
          WHERE status = 'registered'
          GROUP BY event_id
        ) pc ON e.id = pc.event_id
        WHERE p.user_id = ? AND p.status = 'registered'
        ORDER BY p.registration_date DESC
        LIMIT ? OFFSET ?`,
        [userId, limit, offset],
      )

      const events = (rows as any[]).map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.type,
        start_date: event.start_date,
        end_date: event.end_date,
        capacity: event.capacity,
        status: event.status,
        image: event.image,
        price: event.price,
        participants_count: event.participants_count,
        registration_date: event.registration_date,
        venue: event.venue_name
          ? {
              name: event.venue_name,
              address: event.venue_address,
              city: event.venue_city,
            }
          : null,
        organizer: {
          name: `${event.organizer_first_name} ${event.organizer_last_name}`,
          profile_image: event.organizer_profile_image,
        },
      }))

      console.log(`${events.length} participations trouvées pour l'utilisateur ${userId}`)

      return NextResponse.json({
        success: true,
        message: "Participations récupérées avec succès",
        data: events,
        pagination: {
          limit,
          offset,
          total: events.length,
        },
      })
    } catch (dbError) {
      console.error("Erreur base de données:", dbError)
      return NextResponse.json(
        {
          success: false,
          message: "Erreur lors de la récupération des participations",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Erreur dans l'API my-participations:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur",
      },
      { status: 500 },
    )
  }
}
