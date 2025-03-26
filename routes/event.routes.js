import express from "express"
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  submitFeedback,
} from "../controllers/event.controller.js"
import { protect, authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

router.route("/").get(getEvents).post(protect, authorize("admin", "organizer"), createEvent)

router
  .route("/:id")
  .get(getEvent)
  .put(protect, authorize("admin", "organizer"), updateEvent)
  .delete(protect, authorize("admin", "organizer"), deleteEvent)

router.route("/:id/register").post(protect, registerForEvent).delete(protect, cancelRegistration)

router.route("/:id/feedback").post(protect, submitFeedback)

export default router

