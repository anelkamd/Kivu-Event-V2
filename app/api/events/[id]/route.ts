import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function GET(request: NextRequest) {
  try {
    // TODO: Récupère l'ID utilisateur depuis la session ou le token
    // Exemple fictif :
    // const userId = getUserIdFromRequest(request)
    const userId = 1 // À remplacer par la vraie logique

    const [rows] = await pool.execute(
      `
      SELECT 
        e.*,
        u.first_name as organizer_first_name,
        u.last_name as organizer_last_name,
        u.email as organizer_email,
        v.name as venue_name,
        v.street as venue_address,
        v.city as venue_city,
        v.country as venue_country,
        v.capacity as venue_capacity
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.organizer_id = ?
      ORDER BY e.created_at DESC
    `,
      [userId],
    )

    const events = (rows as any[]).map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      start_date: event.start_date,
      end_date: event.end_date,
      capacity: event.capacity,
      registration_deadline: event.registration_deadline,
      status: event.status,
      image: event.image,
      tags: event.tags,
      price: event.price,
      isPublic: !!event.is_public, // ou !event.is_private selon ton schéma
      created_at: event.created_at,
      updated_at: event.updated_at,
      organizer: {
        name:
          event.organizer_first_name && event.organizer_last_name
            ? `${event.organizer_first_name} ${event.organizer_last_name}`
            : "Organisateur par défaut",
        email: event.organizer_email,
      },
      venue: event.venue_name
        ? {
            name: event.venue_name,
            address: event.venue_address,
            city: event.venue_city,
            country: event.venue_country,
            capacity: event.venue_capacity,
          }
        : null,
    }))

    return NextResponse.json({
      success: true,
      data: events,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des événements utilisateur:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}