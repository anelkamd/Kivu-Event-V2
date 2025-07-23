import express from "express"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

const router = express.Router()

// Utilisation de __dirname avec ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads/"))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + ext)
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accepte uniquement les images
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(new Error("Seuls les fichiers image sont autorisés!"), false)
    }
    cb(null, true)
  },
})

// Route pour l'upload d'images
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Aucun fichier uploadé",
      })
    }

    // Créer l'URL pour le fichier uploadé
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`

    return res.status(200).json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    })
  } catch (error) {
    console.error("Erreur lors de l'upload:", error)
    return res.status(500).json({
      success: false,
      error: "Erreur lors de l'upload du fichier",
    })
  }
})

// Gestion des erreurs multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "Le fichier est trop volumineux (max 5MB)",
      })
    }
  }

  return res.status(400).json({
    success: false,
    error: error.message,
  })
})

export default router
