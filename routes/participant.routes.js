import express from "express"
import {
    getParticipants,
    getParticipant,
    updateParticipant,
    deleteParticipant,
    getUserParticipations,
    markAttendance,
} from "../controllers/participant.controller.js"
import { protect, authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

router
    .route("/")
    .get(protect, authorize("admin", "organizer"), getParticipants)

router
    .route("/:id")
    .get(protect, authorize("admin", "organizer"), getParticipant)
    .put(protect, authorize("admin", "organizer"), updateParticipant)
    .delete(protect, authorize("admin"), deleteParticipant)

router
    .route("/user/:userId")
    .get(protect, getUserParticipations)

router
    .route("/:id/attend")
    .put(protect, authorize("admin", "organizer"), markAttendance)

export default router