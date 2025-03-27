import express from "express"
import {
    createSpeaker,
    getSpeakers,
    getSpeaker,
    updateSpeaker,
    deleteSpeaker,
} from "../controllers/speaker.controller.js"
import { protect, authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

router
    .route("/")
    .get(getSpeakers)
    .post(protect, authorize("admin", "organizer"), createSpeaker)

router
    .route("/:id")
    .get(getSpeaker)
    .put(protect, authorize("admin", "organizer"), updateSpeaker)
    .delete(protect, authorize("admin"), deleteSpeaker)

export default router