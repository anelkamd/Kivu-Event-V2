import express from "express"
import {
  registerParticipant,
  getParticipantsByEvent,
  getParticipantById,
  updateParticipant,
  deleteParticipant,
  checkInParticipant,
  verifyQRCode,
} from "../controllers/participant.controller.js"
import { optionalAuth, protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// Routes publiques (inscription anonyme autorisée)
router.post("/:eventId/register", optionalAuth, registerParticipant)
router.post("/verify-qr", verifyQRCode)

// Routes protégées (authentification requise)
router.get("/event/:eventId", protect, getParticipantsByEvent) // ancienne
router.get("/:eventId/participants", protect, getParticipantsByEvent) // ✅ nouvelle route RESTful
router.get("/:participantId", protect, getParticipantById)
router.put("/:participantId", protect, updateParticipant)
router.delete("/:participantId", protect, deleteParticipant)
router.post("/:participantId/checkin", protect, checkInParticipant)

export default router
