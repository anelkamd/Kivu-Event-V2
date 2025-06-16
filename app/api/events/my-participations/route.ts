import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search")
    const type = searchParams.get("type")
    const offset = (page - 1) * limit

    // TODO: Récupérer l'ID de l'utilisateur connecté depuis la session/token
    const currentUserId = "current-user-id" // À remplacer par la vraie logique d'auth

    let query = `
      SELECT e.*, 
             u.id as organizer_id, u.first_name as organizer_first_name, u.last_name as organizer_last_name,
             v.id as venue_id, v.name as venue_name, v.street as venue_address, v.capacity as venue_capacity,
             COUNT(p2.id) as participants_count,
             p.status as participation_status
      FROM events e
      INNER JOIN participants p ON e.id = p.event_id AND p.user_id = ?
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN participants p2 ON e.id = p2.event_id AND p2.status = 'registered'
      WHERE 1=1
    `

    const queryParams: any[] = [currentUserId]

    if (search) {
      query += " AND (e.title LIKE ? OR e.description LIKE ?)"
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    if (type && type !== "all") {
      query += " AND e.type = ?"
      queryParams.push(type)
    }

    query += " GROUP BY e.id ORDER BY e.start_date ASC LIMIT ? OFFSET ?"
    queryParams.push(limit, offset)

    const [rows] = await db.query(query, queryParams)

    // Compter le total
    let countQuery = `
      SELECT COUNT(DISTINCT e.id) as total 
      FROM events e 
      INNER JOIN participants p ON e.id = p.event_id AND p.user_id = ?
      WHERE 1=1
    `
    const countParams = [currentUserId]

    if (search) {
      countQuery += " AND (e.title LIKE ? OR e.description LIKE ?)"
      countParams.push(`%${search}%`, `%${search}%`)
    }

    if (type && type !== "all") {
      countQuery += " AND e.type = ?"
      countParams.push(type)
    }

    const [countRows] = await db.query(countQuery, countParams)
    const total = (countRows as any[])[0].total

    const events = (rows as any[]).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      start_date: row.start_date,
      end_date: row.end_date,
      capacity: row.capacity,
      registration_deadline: row.registration_deadline,
      status: row.status,
      image: row.image,
      price: row.price,
      participants_count: row.participants_count,
      participation_status: row.participation_status,
      organizer: {
        id: row.organizer_id,
        name: `${row.organizer_first_name || ""} ${row.organizer_last_name || ""}`.trim(),
      },
      venue: {
        id: row.venue_id,
        name: row.venue_name,
        address: row.venue_address,
        capacity: row.venue_capacity,
      },
    }))

    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching my participations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch participations" }, { status: 500 })
  }
}
