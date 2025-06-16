import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("image") as unknown as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 })
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Le fichier doit être une image" }, { status: 400 })
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Le fichier est trop volumineux (max 5MB)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Générer un nom de fichier unique
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = join(process.cwd(), "public", "uploads", fileName)

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), "public", "uploads")
    try {
      await writeFile(join(uploadsDir, ".gitkeep"), "")
    } catch (error) {
      // Le dossier existe déjà
    }

    // Sauvegarder le fichier
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`,
      message: "Fichier uploadé avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de l'upload:", error)
    return NextResponse.json({ error: "Erreur lors de l'upload du fichier" }, { status: 500 })
  }
}
