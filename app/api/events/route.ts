import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        // Récupérer les paramètres de requête pour le filtrage
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        // Construire la requête SQL de base
        let query = `
      SELECT e.*, 
             u.id as organizer_id, u.first_name as organizer_first_name, u.last_name as organizer_last_name,
             v.id as venue_id, v.name as venue_name, v.address as venue_address, v.capacity as venue_capacity
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE 1=1
    `;

        const queryParams: any[] = [];

        // Ajouter des conditions de filtrage si nécessaire
        if (type) {
            query += " AND e.type = ?";
            queryParams.push(type);
        }

        if (status) {
            query += " AND e.status = ?";
            queryParams.push(status);
        }

        if (search) {
            query += " AND (e.title LIKE ? OR e.description LIKE ?)";
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        // Exécuter la requête
        const [rows] = await db.query(query, queryParams);

        // Formater les résultats
        const events = (rows as any[]).map(row => {
            return {
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
                    name: `${row.organizer_first_name} ${row.organizer_last_name}`
                },
                venue: {
                    id: row.venue_id,
                    name: row.venue_name,
                    address: row.venue_address,
                    capacity: row.venue_capacity
                }
            };
        });

        return NextResponse.json({
            success: true,
            data: events,
        });
    } catch (error: any) {
        console.error("Error fetching events:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch events" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validation des champs requis
        const requiredFields = ["title", "description", "type", "start_date", "end_date", "capacity", "registration_deadline", "organizer_id", "venue_id"];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { success: false, error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Générer un UUID pour l'événement
        const eventId = uuidv4();

        // Préparer les données pour l'insertion
        const eventData = {
            id: eventId,
            title: body.title,
            description: body.description,
            type: body.type,
            start_date: new Date(body.start_date),
            end_date: new Date(body.end_date),
            capacity: body.capacity,
            registration_deadline: new Date(body.registration_deadline),
            status: body.status || 'draft',
            image: body.image || null,
            tags: body.tags || null,
            price: body.price || 0,
            organizer_id: body.organizer_id,
            venue_id: body.venue_id
        };

        // Insérer l'événement dans la base de données
        const query = `
      INSERT INTO events (
        id, title, description, type, start_date, end_date, 
        capacity, registration_deadline, status, image, 
        tags, price, organizer_id, venue_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const values = [
            eventData.id, eventData.title, eventData.description, eventData.type,
            eventData.start_date, eventData.end_date, eventData.capacity,
            eventData.registration_deadline, eventData.status, eventData.image,
            eventData.tags, eventData.price, eventData.organizer_id, eventData.venue_id
        ];

        await db.query(query, values);

        // Récupérer l'événement créé avec les informations jointes
        const [rows] = await db.query(`
      SELECT e.*, 
             u.id as organizer_id, u.first_name as organizer_first_name, u.last_name as organizer_last_name,
             v.id as venue_id, v.name as venue_name, v.address as venue_address, v.capacity as venue_capacity
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.id = ?
    `, [eventId]);

        if (!rows || (rows as any[]).length === 0) {
            return NextResponse.json(
                { success: false, error: "Failed to retrieve created event" },
                { status: 500 }
            );
        }

        const row = (rows as any[])[0];
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
                name: `${row.organizer_first_name} ${row.organizer_last_name}`
            },
            venue: {
                id: row.venue_id,
                name: row.venue_name,
                address: row.venue_address,
                capacity: row.venue_capacity
            }
        };

        return NextResponse.json({
            success: true,
            data: createdEvent,
        });
    } catch (error: any) {
        console.error("Error creating event:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create event" },
            { status: 500 }
        );
    }
}
