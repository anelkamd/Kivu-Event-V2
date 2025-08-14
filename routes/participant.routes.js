import express from "express"
// CORRECTION: Importe depuis le bon nom de fichier du contrôleur
import {
  register,
  getParticipants,
  getParticipant,
  updateParticipant,
  deleteParticipant,
  getUserParticipations,
  markAttendance,
  verifyQRCode,
} from "../controllers/participant.controller.js"
// CORRECTION: Importe depuis le bon chemin du middleware (middlewares au lieu de middleware)
import { protect, authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

// Route pour l'inscription à un événement (peut être anonyme ou authentifiée)
// Suppression de protect pour permettre l'inscription anonyme
router.post("/:eventId/register", (req, res) => register(req, res))

// Route pour vérifier un QR code
router.post("/verify-qr", protect, authorize("admin", "organizer"), (req, res) => verifyQRCode(req, res))

// Routes pour la gestion des participants (nécessitent une authentification et/ou autorisation)
router.route("/").get(protect, authorize("admin", "organizer"), (req, res) => getParticipants(req, res))

router
  .route("/:id")
  .get(protect, authorize("admin", "organizer"), (req, res) => getParticipant(req, res))
  .put(protect, authorize("admin", "organizer"), (req, res) => updateParticipant(req, res))
  .delete(protect, authorize("admin"), (req, res) => deleteParticipant(req, res))

router.route("/user/:userId").get(protect, (req, res) => getUserParticipations(req, res))

router.route("/:id/attend").put(protect, authorize("admin", "organizer"), (req, res) => markAttendance(req, res))

export default router
