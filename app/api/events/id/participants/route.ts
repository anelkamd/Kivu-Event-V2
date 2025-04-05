import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode';
import db from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const eventId = params.id;

        // Vérifier si l'événement existe
        const [eventCheck] = await db.query(
            "SELECT id FROM events WHERE id = ?",
            [eventId]
        );

        if (!eventCheck || (eventCheck as any[]).length === 0) {
            return NextResponse.json(
                { success: false, error: "Event not found" },
                { status: 404 }
            );
        }

        // Récupérer les participants avec les informations utilisateur
        const [rows] = await db.query(`
      SELECT p.*, 
             u.id as user_id, u.first_name, u.last_name, u.email
      FROM participants p
      JOIN users u ON p.user_id = u.id
      WHERE p.event_id = ?
    `, [eventId]);

        // Formater les résultats
        const participants = await Promise.all((rows as any[]).map(async (row) => {
            // Générer le QR code pour chaque participant
            const qrCodeData = JSON.stringify({
                id: row.id,
                eventId: row.event_id,
                userId: row.user_id
            });

            const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData);

            return {
                id: row.id,
                user_id: row.user_id,
                event_id: row.event_id,
                registration_date: row.registration_date,
                status: row.status,
                company: row.company,
                job_title: row.job_title,
                dietary_restrictions: row.dietary_restrictions,
                special_requirements: row.special_requirements,
                feedback_rating: row.feedback_rating,
                feedback_comment: row.feedback_comment,
                feedback_submitted_at: row.feedback_submitted_at,
                created_at: row.created_at,
                updated_at: row.updated_at,
                user: {
                    id: row.user_id,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    email: row.email
                },
                qrCode: qrCodeDataUrl
            };
        }));

        return NextResponse.json({
            success: true,
            data: participants,
        });
    } catch (error: any) {
        console.error(`Error fetching participants for event ${params.id}:`, error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch participants" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const eventId = params.id;
        const body = await request.json();

        // Validation des champs requis
        if (!body.user_id) {
            return NextResponse.json(
                { success: false, error: "Missing required field: user_id" },
                { status: 400 }
            );
        }

        // Vérifier si l'événement existe
        const [eventCheck] = await db.query(
            "SELECT id FROM events WHERE id = ?",
            [eventId]
        );

        if (!eventCheck || (eventCheck as any[]).length === 0) {
            return NextResponse.json(
                { success: false, error: "Event not found" },
                { status: 404 }
            );
        }

        // Vérifier si l'utilisateur existe
        const [userCheck] = await db.query(
            "SELECT id FROM users WHERE id = ?",
            [body.user_id]
        );

        if (!userCheck || (userCheck as any[]).length === 0) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Vérifier si le participant est déjà inscrit
        const [participantCheck] = await db.query(
            "SELECT id FROM participants WHERE user_id = ? AND event_id = ?",
            [body.user_id, eventId]
        );

        if (participantCheck && (participantCheck as any[]).length > 0) {
            return NextResponse.json(
                { success: false, error: "Participant already registered" },
                { status: 400 }
            );
        }

        // Générer un UUID pour le participant
        const participantId = uuidv4();

        // Préparer les données pour l'insertion
        const participantData = {
            id: participantId,
            user_id: body.user_id,
            event_id: eventId,
            registration_date: new Date(),
            status: body.status || 'registered',
            company: body.company || null,
            job_title: body.job_title || null,
            dietary_restrictions: body.dietary_restrictions || null,
            special_requirements: body.special_requirements || null
        };

        // Insérer le participant dans la base de données
        const query = `
      INSERT INTO participants (
        id, user_id, event_id, registration_date, status,
        company, job_title, dietary_restrictions, special_requirements
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const values = [
            participantData.id, participantData.user_id, participantData.event_id,
            participantData.registration_date, participantData.status,
            participantData.company, participantData.job_title,
            participantData.dietary_restrictions, participantData.special_requirements
        ];

        await db.query(query, values);

        // Récupérer le participant créé avec les informations utilisateur
        const [rows] = await db.query(`
      SELECT p.*, 
             u.id as user_id, u.first_name, u.last_name, u.email
      FROM participants p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [participantId]);

        if (!rows || (rows as any[]).length === 0) {
            return NextResponse.json(
                { success: false, error: "Failed to retrieve created participant" },
                { status: 500 }
            );
        }

        const row = (rows as any[])[0];

        // Générer le QR code
        const qrCodeData = JSON.stringify({
            id: row.id,
            eventId: row.event_id,
            userId: row.user_id
        });

        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData);

        const createdParticipant = {
            id: row.id,
            user_id: row.user_id,
            event_id: row.event_id,
            registration_date: row.registration_date,
            status: row.status,
            company: row.company,
            job_title: row.job_title,
            dietary_restrictions: row.dietary_restrictions,
            special_requirements: row.special_requirements,
            feedback_rating: row.feedback_rating,
            feedback_comment: row.feedback_comment,
            feedback_submitted_at: row.feedback_submitted_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
            user: {
                id: row.user_id,
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email
            },
            qrCode: qrCodeDataUrl
        };

        return NextResponse.json({
            success: true,
            data: createdParticipant,
        });
    } catch (error: any) {
        console.error(`Error registering participant for event ${params.id}:`, error);
        return NextResponse.json(
            { success: false, error: "Failed to register participant" },
            { status: 500 }
        );
    }
}
