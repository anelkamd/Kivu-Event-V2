import express from "express"
import {
  inviteModerator,
  getEventModerators,
  revokeModerator,
  getModeratorDashboard,
  validateTask,
  getTasksToValidate,
} from "../controllers/moderator.controller.js"
import { protect } from "../middleware/auth.middleware.js"
import { requireRole } from "../middleware/auth.middleware.js"

const router = express.Router()

// Routes pour les organisateurs
router.post("/events/:eventId/invite", protect, requireRole(["organizer", "admin"]), inviteModerator)
router.get("/events/:eventId", protect, getEventModerators)
router.delete("/events/:eventId/:moderatorId", protect, requireRole(["organizer", "admin"]), revokeModerator)
router.post("/invite", protect, requireRole(["organizer"]), inviteModerator)

// Routes pour les modérateurs (nécessitent une authentification spéciale)
router.get("/dashboard", protect, requireRole(["moderator"]), getModeratorDashboard)
router.get("/tasks", protect, requireRole(["moderator"]), getTasksToValidate)
router.post("/tasks/:taskId/validate", protect, requireRole(["moderator"]), validateTask)

export default router
