import express from "express"
import {
  registerParticipant,
  getParticipantsByEvent,
  getParticipantById,
  updateParticipant,
  deleteParticipant,
  checkInParticipant,
} from "../controllers/participant.controller.js"
import { protect, optionalAuth } from "../middleware/auth.middleware.js"

const router = express.Router()

// Routes publiques (inscription anonyme)
router.post("/:eventId/register", optionalAuth, registerParticipant)

// Routes protégées (gestion des participants)
router.get("/:eventId", protect, getParticipantsByEvent)
router.get("/:eventId/:participantId", protect, getParticipantById)
router.put("/:eventId/:participantId", protect, updateParticipant)
router.delete("/:eventId/:participantId", protect, deleteParticipant)
router.post("/:eventId/:participantId/checkin", protect, checkInParticipant)

export default router
