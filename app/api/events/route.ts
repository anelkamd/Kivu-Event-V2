import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête pour le filtrage
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Construire la requête SQL de base
    let query = `
      SELECT e.*, 
             u.id as organizer_id, u.first_name as organizer_first_name, u.last_name as organizer_last_name,
             v.id as venue_id, v.name as venue_name, v.street as venue_address, v.capacity as venue_capacity
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE 1=1
    `

    const queryParams: any[] = []

    // Ajouter des conditions de filtrage si nécessaire
    if (type) {
      query += " AND e.type = ?"
      queryParams.push(type)
    }

    if (status) {
      query += " AND e.status = ?"
      queryParams.push(status)
    }

    if (search) {
      query += " AND (e.title LIKE ? OR e.description LIKE ?)"
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    // Ajouter la pagination
    query += " ORDER BY e.created_at DESC LIMIT ? OFFSET ?"
    queryParams.push(limit, offset)

    // Exécuter la requête
    const [rows] = await db.query(query, queryParams)

    // Compter le total pour la pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM events e
      WHERE 1=1
    `
    const countParams: any[] = []

    if (type) {
      countQuery += " AND e.type = ?"
      countParams.push(type)
    }

    if (status) {
      countQuery += " AND e.status = ?"
      countParams.push(status)
    }

    if (search) {
      countQuery += " AND (e.title LIKE ? OR e.description LIKE ?)"
      countParams.push(`%${search}%`, `%${search}%`)
    }

    const [countRows] = await db.query(countQuery, countParams)
    const total = (countRows as any[])[0].total

    // Formater les résultats
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
      tags: row.tags,
      price: row.price,
      organizer_id: row.organizer_id,
      venue_id: row.venue_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
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
    console.error("Error fetching events:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Données reçues:", body)

    // Validation des champs requis
    const requiredFields = ["title", "description", "category", "startDate", "endDate"]
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Champs manquants: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Validation des dates
    const startDate = new Date(body.startDate)
    const endDate = new Date(body.endDate)
    const registrationDeadline = body.registrationDeadline
      ? new Date(body.registrationDeadline)
      : new Date(startDate.getTime() - 24 * 60 * 60 * 1000) // 1 jour avant par défaut

    if (startDate >= endDate) {
      return NextResponse.json(
        {
          success: false,
          error: "La date de fin doit être postérieure à la date de début",
        },
        { status: 400 },
      )
    }

    if (registrationDeadline >= startDate) {
      return NextResponse.json(
        {
          success: false,
          error: "La date limite d'inscription doit être antérieure à la date de début",
        },
        { status: 400 },
      )
    }

    // Générer les IDs
    const eventId = uuidv4()
    const venueId = uuidv4()

    // Commencer une transaction
    const connection = await db.getConnection()
    await connection.beginTransaction()

    try {
      // 1. Créer ou trouver le lieu (venue)
      let finalVenueId = venueId

      if (body.location && body.location.name && body.location.address) {
        // Vérifier si le lieu existe déjà
        const [existingVenues] = await connection.query("SELECT id FROM venues WHERE name = ? AND street = ?", [
          body.location.name,
          body.location.address,
        ])

        if ((existingVenues as any[]).length > 0) {
          finalVenueId = (existingVenues as any[])[0].id
        } else {
          // Créer un nouveau lieu
          await connection.query(
            `INSERT INTO venues (
              id, name, street, city, country, capacity, 
              is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              venueId,
              body.location.name,
              body.location.address,
              body.location.city || "Non spécifié",
              body.location.country || "Non spécifié",
              body.location.capacity || body.capacity || 100,
              true,
            ],
          )
        }
      } else {
        // Créer un lieu par défaut si aucun lieu n'est spécifié
        await connection.query(
          `INSERT INTO venues (
            id, name, street, city, country, capacity, 
            is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            venueId,
            "Lieu à définir",
            "Adresse à définir",
            "Ville à définir",
            "Pays à définir",
            body.capacity || 100,
            true,
          ],
        )
      }

      // 2. Créer l'organisateur par défaut si nécessaire
      let organizerId = body.organizer?.id
      if (!organizerId) {
        // Créer un organisateur par défaut ou utiliser l'utilisateur connecté
        // Pour l'instant, on utilise un ID par défaut
        organizerId = "default-organizer-id"

        // Vérifier si l'organisateur par défaut existe
        const [existingOrganizers] = await connection.query("SELECT id FROM users WHERE id = ?", [organizerId])

        if ((existingOrganizers as any[]).length === 0) {
          // Créer un organisateur par défaut
          await connection.query(
            `INSERT INTO users (
              id, first_name, last_name, email, password, role, 
              is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              organizerId,
              "Organisateur",
              "Par défaut",
              "organizer@kivuevent.com",
              "default-password", // À changer en production
              "organizer",
              true,
            ],
          )
        }
      }

      // 3. Créer l'événement
      const eventData = {
        id: eventId,
        title: body.title,
        description: body.description,
        type: body.category, // Le formulaire utilise "category" mais la DB utilise "type"
        start_date: startDate,
        end_date: endDate,
        capacity: body.capacity || 100,
        registration_deadline: registrationDeadline,
        status: body.status || "draft",
        image: body.image || null,
        tags: body.tags || null,
        price: body.price || 0,
        organizer_id: organizerId,
        venue_id: finalVenueId,
      }

      await connection.query(
        `INSERT INTO events (
          id, title, description, type, start_date, end_date, 
          capacity, registration_deadline, status, image, 
          tags, price, organizer_id, venue_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          eventData.id,
          eventData.title,
          eventData.description,
          eventData.type,
          eventData.start_date,
          eventData.end_date,
          eventData.capacity,
          eventData.registration_deadline,
          eventData.status,
          eventData.image,
          eventData.tags,
          eventData.price,
          eventData.organizer_id,
          eventData.venue_id,
        ],
      )

      // Valider la transaction
      await connection.commit()

      // 4. Récupérer l'événement créé avec les informations jointes
      const [rows] = await db.query(
        `SELECT e.*, 
               u.id as organizer_id, u.first_name as organizer_first_name, u.last_name as organizer_last_name,
               v.id as venue_id, v.name as venue_name, v.street as venue_address, v.capacity as venue_capacity
        FROM events e
        LEFT JOIN users u ON e.organizer_id = u.id
        LEFT JOIN venues v ON e.venue_id = v.id
        WHERE e.id = ?`,
        [eventId],
      )

      if (!rows || (rows as any[]).length === 0) {
        throw new Error("Impossible de récupérer l'événement créé")
      }

      const row = (rows as any[])[0]
      const createdEvent = {
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
        tags: row.tags,
        price: row.price,
        organizer_id: row.organizer_id,
        venue_id: row.venue_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        organizer: {
          id: row.organizer_id,
          name: `${row.organizer_first_name} ${row.organizer_last_name}`,
        },
        venue: {
          id: row.venue_id,
          name: row.venue_name,
          address: row.venue_address,
          capacity: row.venue_capacity,
        },
      }

      return NextResponse.json({
        success: true,
        message: "Événement créé avec succès",
        data: createdEvent,
      })
    } catch (transactionError) {
      // Annuler la transaction en cas d'erreur
      await connection.rollback()
      throw transactionError
    } finally {
      // Libérer la connexion
      connection.release()
    }
  } catch (error: any) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la création de l'événement",
      },
      { status: 500 },
    )
  }
}
