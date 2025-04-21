import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getSession } from "@/lib/session" // Utilisation probable de cette fonction

export async function GET(request: NextRequest) {
    try {
        // Récupérer la session utilisateur
        const session = await getSession(request)

        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
        }

        const userId = session.user.id

        // Récupérer les statistiques globales
        const [totalEventsResult] = await db.query(`SELECT COUNT(*) as count FROM events WHERE organizer_id = ?`, [userId])

        const [upcomingEventsResult] = await db.query(
            `SELECT COUNT(*) as count FROM events 
       WHERE organizer_id = ? AND start_date > NOW()`,
            [userId],
        )

        const [pastEventsResult] = await db.query(
            `SELECT COUNT(*) as count FROM events 
       WHERE organizer_id = ? AND end_date < NOW()`,
            [userId],
        )

        const [totalParticipantsResult] = await db.query(
            `SELECT COUNT(*) as count FROM participants p
       JOIN events e ON p.event_id = e.id
       WHERE e.organizer_id = ?`,
            [userId],
        )

        const totalEvents = (totalEventsResult as any[])[0].count
        const upcomingEvents = (upcomingEventsResult as any[])[0].count
        const pastEvents = (pastEventsResult as any[])[0].count
        const totalParticipants = (totalParticipantsResult as any[])[0].count

        // Récupérer les statistiques des événements récents
        const [recentEventsResult] = await db.query(
            `SELECT e.id, e.title, e.start_date, e.status, 
              COUNT(p.id) as participant_count
       FROM events e
       LEFT JOIN participants p ON e.id = p.event_id
       WHERE e.organizer_id = ?
       GROUP BY e.id
       ORDER BY e.start_date DESC
       LIMIT 5`,
            [userId],
        )

        return NextResponse.json({
            success: true,
            data: {
                totalEvents,
                upcomingEvents,
                pastEvents,
                totalParticipants,
                recentEvents: recentEventsResult,
            },
        })
    } catch (error: any) {
        console.error("Error fetching dashboard stats:", error)
        return NextResponse.json(
            { success: false, error: "Erreur lors de la récupération des statistiques" },
            { status: 500 },
        )
    }
}
