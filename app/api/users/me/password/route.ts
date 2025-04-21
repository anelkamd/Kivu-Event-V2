import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getSession } from "@/lib/session" // Utilisation probable de cette fonction
import { comparePassword, hashPassword } from "@/utils/auth" // Utilisation probable de ces fonctions

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
        if (!body.current_password || !body.new_password) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Le mot de passe actuel et le nouveau mot de passe sont requis",
                },
                { status: 400 },
            )
        }

        // Récupérer le mot de passe actuel de l'utilisateur
        const [rows] = await db.query(`SELECT password FROM users WHERE id = ?`, [userId])

        if (!rows || (rows as any[]).length === 0) {
            return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 })
        }

        const userData = (rows as any[])[0]

        // Vérifier que le mot de passe actuel est correct
        const isPasswordValid = await comparePassword(body.current_password, userData.password)

        if (!isPasswordValid) {
            return NextResponse.json({ success: false, error: "Mot de passe actuel incorrect" }, { status: 400 })
        }

        // Hacher le nouveau mot de passe
        const hashedPassword = await hashPassword(body.new_password)

        // Mettre à jour le mot de passe
        await db.query(`UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?`, [hashedPassword, userId])

        return NextResponse.json({
            success: true,
            message: "Mot de passe mis à jour avec succès",
        })
    } catch (error: any) {
        console.error("Error updating user password:", error)
        return NextResponse.json(
            { success: false, error: "Erreur lors de la mise à jour du mot de passe" },
            { status: 500 },
        )
    }
}
