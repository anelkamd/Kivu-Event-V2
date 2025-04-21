import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest) {
    try {
        // Récupérer la session utilisateur
        const session = await getSession(request)

        console.log("Session received:", session) // Log pour le débogage

        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
        }

        const userId = session.user.id

        // Récupérer les données complètes de l'utilisateur
        const [rows] = await db.query(
            `SELECT id, first_name, last_name, email, phone_number, profile_image, role, created_at 
       FROM users 
       WHERE id = ?`,
            [userId],
        )

        console.log("User data fetched:", rows) // Log pour le débogage

        if (!rows || (rows as any[]).length === 0) {
            return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 })
        }

        const userData = (rows as any[])[0]

        return NextResponse.json({
            success: true,
            data: userData,
        })
    } catch (error: any) {
        console.error("Error fetching user profile:", error)
        return NextResponse.json({ success: false, error: "Erreur lors de la récupération du profil" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Récupérer la session utilisateur
        const session = await getSession(request)

        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
        }

        const userId = session.user.id

        // Récupérer les données du corps de la requête
        const body = await request.json()

        // Valider les données
        const requiredFields = ["first_name", "last_name", "email"]
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json({ success: false, error: `Le champ ${field} est requis` }, { status: 400 })
            }
        }

        // Mettre à jour l'utilisateur
        await db.query(
            `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, phone_number = ?, updated_at = NOW() 
       WHERE id = ?`,
            [body.first_name, body.last_name, body.email, body.phone_number || null, userId],
        )

        // Récupérer l'utilisateur mis à jour
        const [rows] = await db.query(
            `SELECT id, first_name, last_name, email, phone_number, profile_image, role, created_at 
       FROM users 
       WHERE id = ?`,
            [userId],
        )

        const updatedUser = (rows as any[])[0]

        return NextResponse.json({
            success: true,
            data: updatedUser,
        })
    } catch (error: any) {
        console.error("Error updating user profile:", error)
        return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour du profil" }, { status: 500 })
    }
}
