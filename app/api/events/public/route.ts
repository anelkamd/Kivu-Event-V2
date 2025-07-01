import { type NextRequest, NextResponse } from "next/server"
import { sequelize } from "@/config/database.js"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search")
    const type = searchParams.get("type")
    const offset = (page - 1) * limit

    let query = `
      SELECT e.*, 
             CONCAT(u.first_name, ' ', u.last_name) as organizer_name,
             u.profile_image as organizer_image,
             v.name as venue_name, v.street as venue_address,
             COUNT(p.id) as participants_count
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN participants p ON e.id = p.event_id AND p.status = 'registered'
      WHERE e.status = 'published'
    `

    const queryParams: any[] = []

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

    const [rows] = await sequelize.query(query, {
      replacements: queryParams,
    })

    // Compter le total
    let countQuery = `SELECT COUNT(DISTINCT e.id) as total FROM events e WHERE e.status = 'published'`
    const countParams: any[] = []

    if (search) {
      countQuery += " AND (e.title LIKE ? OR e.description LIKE ?)"
      countParams.push(`%${search}%`, `%${search}%`)
    }

    if (type && type !== "all") {
      countQuery += " AND e.type = ?"
      countParams.push(type)
    }

    const [countResult] = await sequelize.query(countQuery, {
      replacements: countParams,
    })

    const total = (countResult as any[])[0]?.total || 0

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
      price: row.price || 0,
      participants_count: row.participants_count || 0,
      organizer: {
        id: row.organizer_id,
        name: row.organizer_name || "Organisateur",
        profile_image: row.organizer_image,
      },
      venue: {
        id: row.venue_id,
        name: row.venue_name || "Lieu à définir",
        address: row.venue_address,
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
    console.error("Error fetching public events:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch public events",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
