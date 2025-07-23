// routes/user.routes.js
import express from "express"
import { protect } from "../middleware/auth.middleware.js"
import { User, Event } from "../models/index.js"
import { AppError } from "../utils/appError.js"

const router = express.Router()

// @desc    Récupérer le profil utilisateur
router.get("/profile", protect, async (req, res, next) => {
  try {
    const user = req.user

    const events = await Event.findAll({
      where: { organizerId: user.id },
    })

    const stats = {
      totalEvents: events.length,
      publishedEvents: events.filter(e => e.status === "published").length,
      draftEvents: events.filter(e => e.status === "draft").length,
      completedEvents: events.filter(e => e.status === "completed").length,
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          company: user.company,
          jobTitle: user.jobTitle,
          profileImage: user.profileImage,
          role: user.role,
          ...stats,
        },
        events,
      },
    })
  } catch (err) {
    next(err)
  }
})

// @desc    Modifier le profil utilisateur
router.put("/profile", protect, async (req, res, next) => {
  try {
    const user = req.user
    const { firstName, lastName, email, phone, company, jobTitle } = req.body

    if (!firstName || !lastName || !email) {
      return next(new AppError("Prénom, nom et email sont requis", 400))
    }

    user.firstName = firstName
    user.lastName = lastName
    user.email = email
    user.phone = phone
    user.company = company
    user.jobTitle = jobTitle

    await user.save()

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        company: user.company,
        jobTitle: user.jobTitle,
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router
