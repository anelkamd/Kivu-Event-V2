import { type NextRequest, NextResponse } from "next/server"
import { sequelize } from "@/config/database.js"
import { getSession } from "@/lib/session"
import { v4 as uuidv4 } from "uuid"
import { use } from "react"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Récupérer la session utilisateur
    const session = await getSession(request)
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
    }

    const { id: eventId } = use(params)
    const currentUserId = session.user.id

    // Vérifier si l'événement existe et est publié
    const [eventRows] = await sequelize.query("SELECT * FROM events WHERE id = ? AND status = 'published'", {
      replacements: [eventId],
    })

    if (!eventRows || (eventRows as any[]).length === 0) {
      return NextResponse.json({ success: false, error: "Événement non trouvé ou non publié" }, { status: 404 })
    }

    const event = (eventRows as any[])[0]

    // Vérifier si l'utilisateur est déjà inscrit
    const [existingParticipation] = await sequelize.query(
      "SELECT * FROM participants WHERE user_id = ? AND event_id = ?",
      {
        replacements: [currentUserId, eventId],
      },
    )

    if (existingParticipation && (existingParticipation as any[]).length > 0) {
      return NextResponse.json({ success: false, error: "Vous êtes déjà inscrit à cet événement" }, { status: 400 })
    }

    // Vérifier la capacité
    const [participantCount] = await sequelize.query(
      "SELECT COUNT(*) as count FROM participants WHERE event_id = ? AND status = 'registered'",
      {
        replacements: [eventId],
      },
    )

    const currentParticipants = (participantCount as any[])[0]?.count || 0

    if (currentParticipants >= event.capacity) {
      return NextResponse.json({ success: false, error: "L'événement est complet" }, { status: 400 })
    }

    // Vérifier la date limite d'inscription
    const registrationDeadline = new Date(event.registration_deadline)
    const now = new Date()

    if (now > registrationDeadline) {
      return NextResponse.json({ success: false, error: "La date limite d'inscription est dépassée" }, { status: 400 })
    }

    // Inscrire l'utilisateur
    const participantId = uuidv4()
    await sequelize.query(
      `INSERT INTO participants (id, user_id, event_id, registration_date, status, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), 'registered', NOW(), NOW())`,
      {
        replacements: [participantId, currentUserId, eventId],
      },
    )

    return NextResponse.json({
      success: true,
      message: "Inscription réussie",
      data: {
        participantId,
        eventId,
        userId: currentUserId,
        status: "registered",
      },
    })
  } catch (error: any) {
    console.error("Error joining event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'inscription",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
