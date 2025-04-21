import { type NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getSession } from "@/lib/session" // Utilisation probable de cette fonction
import { v4 as uuidv4 } from "uuid"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
    try {
        // Récupérer la session utilisateur
        const session = await getSession(request)

        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
        }

        const userId = session.user.id

        // Traiter le formulaire multipart
        const formData = await request.formData()
        const file = formData.get("profile_image") as File

        if (!file) {
            return NextResponse.json({ success: false, error: "Aucun fichier fourni" }, { status: 400 })
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ success: false, error: "Le fichier doit être une image" }, { status: 400 })
        }

        // Générer un nom de fichier unique
        const fileExtension = file.name.split(".").pop()
        const fileName = `${uuidv4()}.${fileExtension}`
        const filePath = `/uploads/profiles/${fileName}`
        const fullPath = path.join(process.cwd(), "public", filePath)

        // Créer le répertoire s'il n'existe pas
        await writeFile(fullPath, Buffer.from(await file.arrayBuffer()))

        // Mettre à jour l'image de profil dans la base de données
        await db.query(`UPDATE users SET profile_image = ?, updated_at = NOW() WHERE id = ?`, [filePath, userId])

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
        console.error("Error updating profile image:", error)
        return NextResponse.json(
            { success: false, error: "Erreur lors de la mise à jour de l'image de profil" },
            { status: 500 },
        )
    }
}
