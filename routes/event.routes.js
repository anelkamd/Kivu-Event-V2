import express from "express"
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getPublicEvents,
  getMyEvents,
  getMyParticipations,
} from "../controllers/eventController.js"
import { getParticipantsByEvent } from "../controllers/participant.controller.js"
import { protect, optionalAuth } from "../middleware/auth.middleware.js"
import multer from "multer"
import path from "path"

const router = express.Router()

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "image-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Seules les images sont autorisées"))
    }
  },
})

// IMPORTANT: Routes spécifiques AVANT les routes avec paramètres
router.get("/public", getPublicEvents) // Événements publics
router.get("/my/events", protect, getMyEvents) // Mes événements
router.get("/my/participations", protect, getMyParticipations) // Mes participations
router.get("/my-events", protect, getMyEvents)

// ✅ Route participants AVANT ":id"
router.get("/:id/participants", protect, getParticipantsByEvent)

// Détails d'un événement (avec auth optionnelle)
router.get("/:id", optionalAuth, getEventById)

// Routes protégées (création, update, suppression)
router.post("/", protect, upload.single("image"), createEvent) // Créer un événement
router.post("/create", protect, upload.single("image"), createEvent) // Créer un événement (alias)
router.get("/", protect, getAllEvents) // Tous les événements (admin/organisateur)
router.put("/:id", protect, upload.single("image"), updateEvent) // Modifier un événement
router.delete("/:id", protect, deleteEvent) // Supprimer un événement
router.patch("/:id/status", protect, updateEventStatus) // Changer le statut

export default router
