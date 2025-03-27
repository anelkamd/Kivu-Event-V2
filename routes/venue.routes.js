import express from "express"
import {
    createVenue,
    getVenues,
    getVenue,
    updateVenue,
    deleteVenue,
} from "../controllers/venue.controller.js"
import { protect, authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

router
    .route("/")
    .get(getVenues)
    .post(protect, authorize("admin", "organizer"), createVenue)

router
    .route("/:id")
    .get(getVenue)
    .put(protect, authorize("admin", "organizer"), updateVenue)
    .delete(protect, authorize("admin"), deleteVenue)

export default router