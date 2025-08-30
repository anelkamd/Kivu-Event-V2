import express from "express"
import { protect, requireRole } from "../middleware/auth.middleware.js"
import * as taskController from "../controllers/task.controller.js"

const router = express.Router()

// Créer une tâche
router.post("/", protect, requireRole(["organizer", "moderator"]), taskController.createTask)

// Récupérer toutes les tâches d'un événement
router.get("/event/:eventId", protect, taskController.getTasksByEvent)

// Assigner une tâche à un modérateur
router.post("/assign", protect, requireRole(["organizer"]), taskController.assignTask)

// Récupérer toutes les tâches de l'utilisateur connecté
router.get("/user", protect, taskController.getUserTasks)

// Mettre à jour le statut ou la progression d'une tâche
router.put("/:taskId", protect, taskController.updateTask)

// Supprimer une tâche
router.delete("/:taskId", protect, requireRole(["organizer"]), taskController.deleteTask)

export default router
