import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import db from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id

    // TODO: Récupérer l'ID de l'utilisateur connecté depuis la session/token
    const currentUserId = "current-user-id" // À remplacer par la vraie logique d'auth

    // Vérifier si l'événement existe et est disponible
    const [eventRows] = await db.query("SELECT * FROM events WHERE id = ? AND status = 'published'", [eventId])

    if (!eventRows || (eventRows as any[]).length === 0) {
      return NextResponse.json({ success: false, error: "Événement non trouvé ou non disponible" }, { status: 404 })
    }

    const event = (eventRows as any[])[0]

    // Vérifier si l'utilisateur est déjà inscrit
    const [existingParticipation] = await db.query("SELECT id FROM participants WHERE user_id = ? AND event_id = ?", [
      currentUserId,
      eventId,
    ])

    if (existingParticipation && (existingParticipation as any[]).length > 0) {
      return NextResponse.json({ success: false, error: "Vous êtes déjà inscrit à cet événement" }, { status: 400 })
    }

    // Vérifier la capacité
    const [participantCount] = await db.query(
      "SELECT COUNT(*) as count FROM participants WHERE event_id = ? AND status = 'registered'",
      [eventId],
    )

    const currentCount = (participantCount as any[])[0].count
    if (currentCount >= event.capacity) {
      return NextResponse.json({ success: false, error: "L'événement est complet" }, { status: 400 })
    }

    // Inscrire l'utilisateur
    const participantId = uuidv4()
    await db.query(
      `INSERT INTO participants (
        id, user_id, event_id, registration_date, status, created_at, updated_at
      ) VALUES (?, ?, ?, NOW(), 'registered', NOW(), NOW())`,
      [participantId, currentUserId, eventId],
    )

    return NextResponse.json({
      success: true,
      message: "Inscription réussie à l'événement",
    })
  } catch (error: any) {
    console.error("Error joining event:", error)
    return NextResponse.json({ success: false, error: "Erreur lors de l'inscription" }, { status: 500 })
  }
}
