import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const eventId = params.id;

        // Récupérer l'événement avec les informations jointes
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
                { success: false, error: "Event not found" },
                { status: 404 }
            );
        }

        const row = (rows as any[])[0];
        const event = {
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
            data: event,
        });
    } catch (error: any) {
        console.error(`Error fetching event ${params.id}:`, error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch event" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const eventId = params.id;
        const body = await request.json();

        // Vérifier si l'événement existe
        const [checkResult] = await db.query(
            "SELECT id FROM events WHERE id = ?",
            [eventId]
        );

        if (!checkResult || (checkResult as any[]).length === 0) {
            return NextResponse.json(
                { success: false, error: "Event not found" },
                { status: 404 }
            );
        }

        // Préparer les données pour la mise à jour
        const updateFields = [];
        const updateValues = [];

        // Ajouter chaque champ à mettre à jour
        if (body.title !== undefined) {
            updateFields.push("title = ?");
            updateValues.push(body.title);
        }
        if (body.description !== undefined) {
            updateFields.push("description = ?");
            updateValues.push(body.description);
        }
        if (body.type !== undefined) {
            updateFields.push("type = ?");
            updateValues.push(body.type);
        }
        if (body.start_date !== undefined) {
            updateFields.push("start_date = ?");
            updateValues.push(new Date(body.start_date));
        }
        if (body.end_date !== undefined) {
            updateFields.push("end_date = ?");
            updateValues.push(new Date(body.end_date));
        }
        if (body.capacity !== undefined) {
            updateFields.push("capacity = ?");
            updateValues.push(body.capacity);
        }
        if (body.registration_deadline !== undefined) {
            updateFields.push("registration_deadline = ?");
            updateValues.push(new Date(body.registration_deadline));
        }
        if (body.status !== undefined) {
            updateFields.push("status = ?");
            updateValues.push(body.status);
        }
        if (body.image !== undefined) {
            updateFields.push("image = ?");
            updateValues.push(body.image);
        }
        if (body.tags !== undefined) {
            updateFields.push("tags = ?");
            updateValues.push(body.tags);
        }
        if (body.price !== undefined) {
            updateFields.push("price = ?");
            updateValues.push(body.price);
        }
        if (body.venue_id !== undefined) {
            updateFields.push("venue_id = ?");
            updateValues.push(body.venue_id);
        }

        // Si aucun champ à mettre à jour, retourner l'événement tel quel
        if (updateFields.length === 0) {
            const [rows] = await db.query(`
        SELECT e.*, 
               u.id as organizer_id, u.first_name as organizer_first_name, u.last_name as organizer_last_name,
               v.id as venue_id, v.name as venue_name, v.address as venue_address, v.capacity as venue_capacity
        FROM events e
        LEFT JOIN users u ON e.organizer_id = u.id
        LEFT JOIN venues v ON e.venue_id = v.id
        WHERE e.id = ?
      `, [eventId]);

            const row = (rows as any[])[0];
            return NextResponse.json({
                success: true,
                data: {
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
                },
            });
        }

        // Construire la requête de mise à jour
        const updateQuery = `
      UPDATE events 
      SET ${updateFields.join(", ")} 
      WHERE id = ?
    `;

        // Ajouter l'ID de l'événement aux valeurs
        updateValues.push(eventId);

        // Exécuter la mise à jour
        await db.query(updateQuery, updateValues);

        // Récupérer l'événement mis à jour
        const [rows] = await db.query(`
      SELECT e.*, 
             u.id as organizer_id, u.first_name as organizer_first_name, u.last_name as organizer_last_name,
             v.id as venue_id, v.name as venue_name, v.address as venue_address, v.capacity as venue_capacity
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.id = ?
    `, [eventId]);

        const row = (rows as any[])[0];
        const updatedEvent = {
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
            data: updatedEvent,
        });
    } catch (error: any) {
        console.error(`Error updating event ${params.id}:`, error);
        return NextResponse.json(
            { success: false, error: "Failed to update event" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const eventId = params.id;

        // Récupérer l'événement avant de le supprimer
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
                { success: false, error: "Event not found" },
                { status: 404 }
            );
        }

        const row = (rows as any[])[0];
        const eventToDelete = {
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

        // Supprimer l'événement
        await db.query("DELETE FROM events WHERE id = ?", [eventId]);

        return NextResponse.json({
            success: true,
            data: eventToDelete,
        });
    } catch (error: any) {
        console.error(`Error deleting event ${params.id}:`, error);
        return NextResponse.json(
            { success: false, error: "Failed to delete event" },
            { status: 500 }
        );
    }
}
