import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Fonction utilitaire pour extraire l'ID utilisateur du token
function getUserIdFromToken(token: string): string | null {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key") as any
        return decoded.userId || decoded.id || decoded.sub || null
    } catch (error) {
        console.error("Erreur de décodage du token:", error)
        return null
    }
}

export async function GET() {
    // Cette version simplifiée retourne des données statiques pour le test
    return NextResponse.json({
        success: true,
        message: "Données utilisateur récupérées avec succès",
        data: {
            id: "user-123",
            first_name: "Jean",
            last_name: "Dupont",
            email: "jean.dupont@example.com",
            phone_number: "+243123456789",
            role: "admin",
            created_at: new Date().toISOString(),
            profile_image: null,
        },
    })
}
