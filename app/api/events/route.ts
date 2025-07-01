import { type NextRequest, NextResponse } from "next/server"
import { sequelize } from "@/config/database.js"
import { getSession } from "@/lib/session"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search")
    const type = searchParams.get("type")
    const status = searchParams.get("status")
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
      WHERE 1=1
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

    if (status && status !== "all") {
      query += " AND e.status = ?"
      queryParams.push(status)
    }

    query += " GROUP BY e.id ORDER BY e.created_at DESC LIMIT ? OFFSET ?"
    queryParams.push(limit, offset)

    const [rows] = await sequelize.query(query, {
      replacements: queryParams,
    })

    // Compter le total
    let countQuery = `SELECT COUNT(DISTINCT e.id) as total FROM events e WHERE 1=1`
    const countParams: any[] = []

    if (search) {
      countQuery += " AND (e.title LIKE ? OR e.description LIKE ?)"
      countParams.push(`%${search}%`, `%${search}%`)
    }

    if (type && type !== "all") {
      countQuery += " AND e.type = ?"
      countParams.push(type)
    }

    if (status && status !== "all") {
      countQuery += " AND e.status = ?"
      countParams.push(status)
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
    console.error("Error fetching events:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch events",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Récupérer la session utilisateur
    const session = await getSession(request)
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    const currentUserId = session.user.id
    const body = await request.json()

    // Validation des données
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      location,
      capacity,
      status = "draft",
      registrationDeadline,
      price = 0,
      tags = "",
      image = null,
    } = body

    if (!title || !description || !category || !startDate || !endDate || !capacity || !registrationDeadline) {
      return NextResponse.json({ success: false, error: "Champs obligatoires manquants" }, { status: 400 })
    }

    // Validation des dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    const regDeadline = new Date(registrationDeadline)
    const now = new Date()

    if (start <= now) {
      return NextResponse.json({ success: false, error: "La date de début doit être dans le futur" }, { status: 400 })
    }

    if (end <= start) {
      return NextResponse.json(
        { success: false, error: "La date de fin doit être après la date de début" },
        { status: 400 },
      )
    }

    if (regDeadline >= start) {
      return NextResponse.json(
        { success: false, error: "La date limite d'inscription doit être avant le début de l'événement" },
        { status: 400 },
      )
    }

    const transaction = await sequelize.transaction()

    try {
      // Créer ou récupérer le lieu
      let venueId = null
      if (location && location.name) {
        const venueUuid = uuidv4()
        await sequelize.query(
          `INSERT INTO venues (id, name, street, city, country, capacity, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          {
            replacements: [
              venueUuid,
              location.name,
              location.address || "",
              location.city || "",
              location.country || "RDC",
              location.capacity || capacity,
            ],
            transaction,
          },
        )
        venueId = venueUuid
      }

      // Créer l'événement
      const eventId = uuidv4()
      await sequelize.query(
        `INSERT INTO events (
          id, title, description, type, start_date, end_date, capacity, 
          registration_deadline, status, image, tags, price, organizer_id, 
          venue_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            eventId,
            title,
            description,
            category,
            startDate,
            endDate,
            capacity,
            registrationDeadline,
            status,
            image,
            tags,
            price,
            currentUserId,
            venueId,
          ],
          transaction,
        },
      )

      await transaction.commit()

      // Récupérer l'événement créé avec les jointures
      const [eventRows] = await sequelize.query(
        `SELECT e.*, 
                CONCAT(u.first_name, ' ', u.last_name) as organizer_name,
                v.name as venue_name, v.street as venue_address
         FROM events e
         LEFT JOIN users u ON e.organizer_id = u.id
         LEFT JOIN venues v ON e.venue_id = v.id
         WHERE e.id = ?`,
        {
          replacements: [eventId],
        },
      )

      const createdEvent = (eventRows as any[])[0]

      return NextResponse.json({
        success: true,
        message: "Événement créé avec succès",
        data: {
          id: createdEvent.id,
          title: createdEvent.title,
          description: createdEvent.description,
          type: createdEvent.type,
          start_date: createdEvent.start_date,
          end_date: createdEvent.end_date,
          capacity: createdEvent.capacity,
          registration_deadline: createdEvent.registration_deadline,
          status: createdEvent.status,
          image: createdEvent.image,
          price: createdEvent.price,
          organizer: {
            id: createdEvent.organizer_id,
            name: createdEvent.organizer_name,
          },
          venue: {
            id: createdEvent.venue_id,
            name: createdEvent.venue_name,
            address: createdEvent.venue_address,
          },
        },
      })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } catch (error: any) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création de l'événement",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
