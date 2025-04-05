import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import db from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string; participantId: string } }
) {
    try {
        const { id: eventId, participantId } = params;

        // Récupérer le participant avec les informations utilisateur
        const [rows] = await db.query(`
      SELECT p.*, 
             u.id as user_id, u.first_name, u.last_name, u.email
      FROM participants p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND p.event_id = ?
    `, [participantId, eventId]);

        if (!rows || (rows as any[]).length === 0) {
            return NextResponse.json(
                { success: false, error: "Participant not found" },
                { status: 404 }
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

        const participant = {
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
            data: participant,
        });
    } catch (error: any) {
        console.error(`Error fetching participant ${params.participantId}:`, error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch participant" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string; participantId: string } }
) {
    try {
        const { id: eventId, participantId } = params;
        const body = await request.json();

        // Vérifier si le participant existe
        const [checkResult] = await db.query(
            "SELECT id FROM participants WHERE id = ? AND event_id = ?",
            [participantId, eventId]
        );

        if (!checkResult || (checkResult as any[]).length === 0) {
            return NextResponse.json(
                { success: false, error: "Participant not found" },
                { status: 404 }
            );
        }

        // Préparer les données pour la mise à jour
        const updateFields = [];
        const updateValues = [];

        // Ajouter chaque champ à mettre à jour
        if (body.status !== undefined) {
            updateFields.push("status = ?");
            updateValues.push(body.status);
        }
        if (body.company !== undefined) {
            updateFields.push("company = ?");
            updateValues.push(body.company);
        }
        if (body.job_title !== undefined) {
            updateFields.push("job_title = ?");
            updateValues.push(body.job_title);
        }
        if (body.dietary_restrictions !== undefined) {
            updateFields.push("dietary_restrictions = ?");
            updateValues.push(body.dietary_restrictions);
        }
        if (body.special_requirements !== undefined) {
            updateFields.push("special_requirements = ?");
            updateValues.push(body.special_requirements);
        }
        if (body.feedback_rating !== undefined) {
            updateFields.push("feedback_rating = ?");
            updateValues.push(body.feedback_rating);
        }
        if (body.feedback_comment !== undefined) {
            updateFields.push("feedback_comment = ?");
            updateValues.push(body.feedback_comment);
        }
        if (body.feedback_submitted_at !== undefined) {
            updateFields.push("feedback_submitted_at = ?");
            updateValues.push(new Date(body.feedback_submitted_at));
        }

        // Si aucun champ à mettre à jour, retourner le participant tel quel
        if (updateFields.length === 0) {
            const [rows] = await db.query(`
        SELECT p.*, 
               u.id as user_id, u.first_name, u.last_name, u.email
        FROM participants p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ? AND p.event_id = ?
      `, [participantId, eventId]);

            const row = (rows as any[])[0];

            // Générer le QR code
            const qrCodeData = JSON.stringify({
                id: row.id,
                eventId: row.event_id,
                userId: row.user_id
            });

            const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData);

            return NextResponse.json({
                success: true,
                data: {
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
                },
            });
        }

        // Construire la requête de mise à jour
        const updateQuery = `
      UPDATE participants 
      SET ${updateFields.join(", ")} 
      WHERE id = ? AND event_id = ?
    `;

        // Ajouter l'ID du participant et l'ID de l'événement aux valeurs
        updateValues.push(participantId, eventId);

        // Exécuter la mise à jour
        await db.query(updateQuery, updateValues);

        // Récupérer le participant mis à jour
        const [rows] = await db.query(`
      SELECT p.*, 
             u.id as user_id, u.first_name, u.last_name, u.email
      FROM participants p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND p.event_id = ?
    `, [participantId, eventId]);

        const row = (rows as any[])[0];

        // Générer le QR code
        const qrCodeData = JSON.stringify({
            id: row.id,
            eventId: row.event_id,
            userId: row.user_id
        });

        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData);

        const updatedParticipant = {
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
            data: updatedParticipant,
        });
    } catch (error: any) {
        console.error(`Error updating participant ${params.participantId}:`, error);
        return NextResponse.json(
            { success: false, error: "Failed to update participant" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; participantId: string } }
) {
    try {
        const { id: eventId, participantId } = params;

        // Récupérer le participant avant de le supprimer
        const [rows] = await db.query(`
      SELECT p.*, 
             u.id as user_id, u.first_name, u.last_name, u.email
      FROM participants p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND p.event_id = ?
    `, [participantId, eventId]);

        if (!rows || (rows as any[]).length === 0) {
            return NextResponse.json(
                { success: false, error: "Participant not found" },
                { status: 404 }
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

        const participantToDelete = {
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

        // Supprimer le participant
        await db.query("DELETE FROM participants WHERE id = ? AND event_id = ?", [participantId, eventId]);

        return NextResponse.json({
            success: true,
            data: participantToDelete,
        });
    } catch (error: any) {
        console.error(`Error deleting participant ${params.participantId}:`, error);
        return NextResponse.json(
            { success: false, error: "Failed to delete participant" },
            { status: 500 }
        );
    }
}
