import express from "express"
import eventController from "../controllers/eventController.js"
// Correction du chemin d'importation : utilisez le nom de fichier correct 'auth.middleware.js'
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// Routes CRUD pour les événements
router.post("/create", protect, (req, res) => eventController.createEvent(req, res))
router.get("/", (req, res) => eventController.getAllEvents(req, res))
router.get("/:id", (req, res) => eventController.getEventById(req, res))
router.put("/:id", (req, res) => eventController.updateEvent(req, res))
router.delete("/:id", (req, res) => eventController.deleteEvent(req, res))
router.patch("/:id/status", (req, res) => eventController.toggleEventStatus(req, res))

export default router
