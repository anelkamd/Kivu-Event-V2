import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const { qrCode } = await request.json();

        if (!qrCode) {
            return NextResponse.json(
                { success: false, error: "QR code is required" },
                { status: 400 }
            );
        }

        // Décoder les données du QR code
        let qrData;
        try {
            qrData = JSON.parse(qrCode);
        } catch (error) {
            return NextResponse.json(
                { success: false, error: "Invalid QR code" },
                { status: 400 }
            );
        }

        const { id: participantId, eventId } = qrData;

        if (!participantId || !eventId) {
            return NextResponse.json(
                { success: false, error: "Invalid QR code data" },
                { status: 400 }
            );
        }

        const [participantCheck] = await db.query(
            "SELECT * FROM participants WHERE id = ? AND event_id = ?",
            [participantId, eventId]
        );

        if (!participantCheck || (participantCheck as any[]).length === 0) {
            return NextResponse.json(
                { success: false, error: "Participant not found" },
                { status: 404 }
            );
        }

        const participant = (participantCheck as any[])[0];

        // Vérifier si le participant est déjà enregistré
        if (participant.status === "attended") {
            // Récupérer les informations utilisateur
            const [userInfo] = await db.query(
                "SELECT first_name, last_name, email FROM users WHERE id = ?",
                [participant.user_id]
            );

            const user = (userInfo as any[])[0];

            return NextResponse.json({
                success: false,
                error: "Participant already checked in",
                participant: {
                    ...participant,
                    user: {
                        id: participant.user_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email
                    }
                },
            });
        }

        await db.query(
            "UPDATE participants SET status = 'attended' WHERE id = ? AND event_id = ?",
            [participantId, eventId]
        );

        const [rows] = await db.query(`
      SELECT p.*, 
             u.id as user_id, u.first_name, u.last_name, u.email
      FROM participants p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND p.event_id = ?
    `, [participantId, eventId]);

        const updatedParticipant = (rows as any[])[0];

        return NextResponse.json({
            success: true,
            message: "Check-in successful",
            participant: {
                id: updatedParticipant.id,
                user_id: updatedParticipant.user_id,
                event_id: updatedParticipant.event_id,
                registration_date: updatedParticipant.registration_date,
                status: updatedParticipant.status,
                company: updatedParticipant.company,
                job_title: updatedParticipant.job_title,
                dietary_restrictions: updatedParticipant.dietary_restrictions,
                special_requirements: updatedParticipant.special_requirements,
                feedback_rating: updatedParticipant.feedback_rating,
                feedback_comment: updatedParticipant.feedback_comment,
                feedback_submitted_at: updatedParticipant.feedback_submitted_at,
                created_at: updatedParticipant.created_at,
                updated_at: updatedParticipant.updated_at,
                user: {
                    id: updatedParticipant.user_id,
                    first_name: updatedParticipant.first_name,
                    last_name: updatedParticipant.last_name,
                    email: updatedParticipant.email
                }
            },
        });
    } catch (error: any) {
        console.error("Error during check-in:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process check-in" },
            { status: 500 }
        );
    }
}
