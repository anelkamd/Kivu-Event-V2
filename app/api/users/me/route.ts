import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getSession } from "@/lib/session" // <== Import de ta fonction de session

export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request)

        if (!session) {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
        }

        const userId = session.user.id

        const [rows] = await db.query(
            `SELECT id, first_name, last_name, email, phone_number, profile_image, role, created_at 
       FROM users 
       WHERE id = ?`,
            [userId]
        )

        if (!rows || (rows as any[]).length === 0) {
            return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 })
        }

        const userData = (rows as any[])[0]

        return NextResponse.json({ success: true, data: userData })
    } catch (error: any) {
        console.error("Erreur récupération profil:", error)
        return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getSession(request)

        if (!session) {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
        }

        const userId = session.user.id
        const body = await request.json()

        const requiredFields = ["first_name", "last_name", "email"]
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json({ success: false, error: `Le champ ${field} est requis` }, { status: 400 })
            }
        }

        await db.query(
            `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, phone_number = ?, updated_at = NOW() 
       WHERE id = ?`,
            [body.first_name, body.last_name, body.email, body.phone_number || null, userId]
        )

        const [rows] = await db.query(
            `SELECT id, first_name, last_name, email, phone_number, profile_image, role, created_at 
       FROM users 
       WHERE id = ?`,
            [userId]
        )

        const updatedUser = (rows as any[])[0]

        return NextResponse.json({ success: true, data: updatedUser })
    } catch (error: any) {
        console.error("Erreur mise à jour profil:", error)
        return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
    }
}
