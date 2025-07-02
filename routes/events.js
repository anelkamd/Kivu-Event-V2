const express = require("express")
const { pool } = require("../config/database")
const auth = require("../middleware/auth")
const { v4: uuidv4 } = require("uuid")

const router = express.Router()

// Route pour récupérer tous les événements publics
router.get("/public", async (req, res) => {
  try {
    const [events] = await pool.execute(
      `SELECT 
        e.id, e.title, e.description, e.type, 
        e.start_date as startDate, e.end_date as endDate,
        e.capacity, e.registration_deadline as registrationDeadline,
        e.status, e.image, e.price, e.tags,
        e.created_at as createdAt,
        v.name as venueName, v.address as venueAddress, v.city as venueCity,
        u.first_name as organizerFirstName, u.last_name as organizerLastName,
        COUNT(p.id) as participantCount
       FROM events e
       LEFT JOIN venues v ON e.venue_id = v.id
       LEFT JOIN users u ON e.organizer_id = u.id
       LEFT JOIN participants p ON e.id = p.event_id AND p.status IN ('registered', 'attended')
       WHERE e.status = 'published' AND e.start_date > NOW()
       GROUP BY e.id
       ORDER BY e.start_date ASC`,
    )

    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      capacity: event.capacity,
      registrationDeadline: event.registrationDeadline,
      status: event.status,
      image: event.image,
      price: event.price || 0,
      tags: event.tags,
      participantCount: Number.parseInt(event.participantCount) || 0,
      venue: event.venueName
        ? {
            name: event.venueName,
            address: event.venueAddress,
            city: event.venueCity,
          }
        : null,
      organizer: {
        firstName: event.organizerFirstName,
        lastName: event.organizerLastName,
      },
      createdAt: event.createdAt,
    }))

    res.json({
      success: true,
      data: formattedEvents,
    })
  } catch (error) {
    console.error("Erreur récupération événements:", error)
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des événements",
    })
  }
})

// Route pour récupérer les événements de l'utilisateur connecté
router.get("/my-events", auth, async (req, res) => {
  try {
    const userId = req.user.userId

    const [events] = await pool.execute(
      `SELECT 
        e.id, e.title, e.description, e.type, 
        e.start_date as startDate, e.end_date as endDate,
        e.capacity, e.registration_deadline as registrationDeadline,
        e.status, e.image, e.price, e.tags,
        e.created_at as createdAt, e.updated_at as updatedAt,
        v.name as venueName, v.address as venueAddress, v.city as venueCity,
        COUNT(p.id) as participantCount
       FROM events e
       LEFT JOIN venues v ON e.venue_id = v.id
       LEFT JOIN participants p ON e.id = p.event_id AND p.status IN ('registered', 'attended')
       WHERE e.organizer_id = ?
       GROUP BY e.id
       ORDER BY e.created_at DESC`,
      [userId],
    )

    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      capacity: event.capacity,
      registrationDeadline: event.registrationDeadline,
      status: event.status,
      image: event.image,
      price: event.price || 0,
      tags: event.tags,
      participantCount: Number.parseInt(event.participantCount) || 0,
      venue: event.venueName
        ? {
            name: event.venueName,
            address: event.venueAddress,
            city: event.venueCity,
          }
        : null,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }))

    res.json({
      success: true,
      data: formattedEvents,
    })
  } catch (error) {
    console.error("Erreur récupération mes événements:", error)
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de vos événements",
    })
  }
})

// Route pour récupérer les participants d'un événement
router.get("/:id/participants", auth, async (req, res) => {
  try {
    const userId = req.user.userId
    const eventId = req.params.id

    // Vérifier que l'utilisateur est le propriétaire de l'événement
    const [eventOwner] = await pool.execute("SELECT organizer_id FROM events WHERE id = ?", [eventId])

    if (eventOwner.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Événement non trouvé",
      })
    }

    if (eventOwner[0].organizer_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "Accès non autorisé - Vous n'êtes pas l'organisateur de cet événement",
      })
    }

    // Récupérer les participants avec leurs informations
    const [participants] = await pool.execute(
      `SELECT 
        p.id, p.registration_date as registrationDate, p.status,
        p.company, p.job_title as jobTitle, p.dietary_restrictions as dietaryRestrictions,
        p.special_requirements as specialRequirements, p.feedback_rating as feedbackRating,
        p.feedback_comment as feedbackComment, p.feedback_submitted_at as feedbackSubmittedAt,
        p.first_name as guestFirstName, p.last_name as guestLastName, 
        p.email as guestEmail, p.phone as guestPhone,
        u.first_name as userFirstName, u.last_name as userLastName, 
        u.email as userEmail, u.phone as userPhone,
        p.created_at as createdAt
       FROM participants p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.event_id = ?
       ORDER BY p.registration_date DESC`,
      [eventId],
    )

    // Récupérer les informations de l'événement
    const [eventInfo] = await pool.execute(
      `SELECT 
        e.title, e.capacity, e.start_date as startDate,
        COUNT(p.id) as totalParticipants,
        SUM(CASE WHEN p.status = 'registered' THEN 1 ELSE 0 END) as registeredCount,
        SUM(CASE WHEN p.status = 'attended' THEN 1 ELSE 0 END) as attendedCount,
        SUM(CASE WHEN p.status = 'cancelled' THEN 1 ELSE 0 END) as cancelledCount,
        SUM(CASE WHEN p.status = 'no-show' THEN 1 ELSE 0 END) as noShowCount
       FROM events e
       LEFT JOIN participants p ON e.id = p.event_id
       WHERE e.id = ?
       GROUP BY e.id`,
      [eventId],
    )

    const formattedParticipants = participants.map((participant) => ({
      id: participant.id,
      firstName: participant.userFirstName || participant.guestFirstName || "Invité",
      lastName: participant.userLastName || participant.guestLastName || "",
      email: participant.userEmail || participant.guestEmail || "Non renseigné",
      phone: participant.userPhone || participant.guestPhone,
      company: participant.company,
      jobTitle: participant.jobTitle,
      status: participant.status,
      registrationDate: participant.registrationDate,
      dietaryRestrictions: participant.dietaryRestrictions,
      specialRequirements: participant.specialRequirements,
      feedbackRating: participant.feedbackRating,
      feedbackComment: participant.feedbackComment,
      feedbackSubmittedAt: participant.feedbackSubmittedAt,
      createdAt: participant.createdAt,
      hasAccount: !!participant.userFirstName,
    }))

    const eventData = eventInfo[0] || {}

    res.json({
      success: true,
      data: {
        event: {
          title: eventData.title,
          capacity: eventData.capacity,
          startDate: eventData.startDate,
        },
        participants: formattedParticipants,
        statistics: {
          total: Number.parseInt(eventData.totalParticipants) || 0,
          registered: Number.parseInt(eventData.registeredCount) || 0,
          attended: Number.parseInt(eventData.attendedCount) || 0,
          cancelled: Number.parseInt(eventData.cancelledCount) || 0,
          noShow: Number.parseInt(eventData.noShowCount) || 0,
        },
      },
    })
  } catch (error) {
    console.error("Erreur récupération participants:", error)
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des participants",
    })
  }
})

// Route pour créer un événement
router.post("/create", auth, async (req, res) => {
  try {
    const userId = req.user.userId
    const { title, description, type, startDate, endDate, capacity, registrationDeadline, price, tags, venue, image } =
      req.body

    // Validation
    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Les champs titre, description, date de début et date de fin sont obligatoires",
      })
    }

    let venueId = null

    // Créer le lieu si fourni
    if (venue && venue.name) {
      const [venueResult] = await pool.execute(
        "INSERT INTO venues (name, address, city, capacity, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
        [venue.name, venue.address || null, venue.city || null, venue.capacity || null],
      )
      venueId = venueResult.insertId
    }

    // Créer l'événement
    const [eventResult] = await pool.execute(
      `INSERT INTO events (
        title, description, type, start_date, end_date, capacity, 
        registration_deadline, price, tags, venue_id, organizer_id, 
        image, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW(), NOW())`,
      [
        title,
        description,
        type || "conference",
        startDate,
        endDate,
        capacity || null,
        registrationDeadline || null,
        price || 0,
        tags || null,
        venueId,
        userId,
        image || null,
      ],
    )

    // Récupérer l'événement créé
    const [createdEvent] = await pool.execute(
      `SELECT 
        e.id, e.title, e.description, e.type, 
        e.start_date as startDate, e.end_date as endDate,
        e.capacity, e.registration_deadline as registrationDeadline,
        e.status, e.image, e.price, e.tags,
        e.created_at as createdAt,
        v.name as venueName, v.address as venueAddress, v.city as venueCity
       FROM events e
       LEFT JOIN venues v ON e.venue_id = v.id
       WHERE e.id = ?`,
      [eventResult.insertId],
    )

    res.status(201).json({
      success: true,
      message: "Événement créé avec succès",
      data: createdEvent[0],
    })
  } catch (error) {
    console.error("Erreur création événement:", error)
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création de l'événement",
    })
  }
})

// Route pour s'inscrire à un événement (sans compte)
router.post("/register-guest", async (req, res) => {
  try {
    const { eventId, firstName, lastName, email, phone, company, jobTitle } = req.body

    // Validation
    if (!eventId || !firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: "Les champs événement, prénom, nom et email sont obligatoires",
      })
    }

    // Vérifier que l'événement existe et est ouvert aux inscriptions
    const [events] = await pool.execute(
      "SELECT id, title, capacity, registration_deadline FROM events WHERE id = ? AND status = 'published'",
      [eventId],
    )

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Événement non trouvé ou non disponible pour inscription",
      })
    }

    const event = events[0]

    // Vérifier la date limite d'inscription
    if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
      return res.status(400).json({
        success: false,
        error: "La date limite d'inscription est dépassée",
      })
    }

    // Vérifier la capacité
    if (event.capacity) {
      const [participantCount] = await pool.execute(
        "SELECT COUNT(*) as count FROM participants WHERE event_id = ? AND status IN ('registered', 'attended')",
        [eventId],
      )

      if (participantCount[0].count >= event.capacity) {
        return res.status(400).json({
          success: false,
          error: "L'événement est complet",
        })
      }
    }

    // Vérifier si l'email n'est pas déjà inscrit
    const [existingParticipant] = await pool.execute("SELECT id FROM participants WHERE event_id = ? AND email = ?", [
      eventId,
      email,
    ])

    if (existingParticipant.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cet email est déjà inscrit à l'événement",
      })
    }

    // Créer l'inscription
    const registrationToken = uuidv4()
    await pool.execute(
      `INSERT INTO participants (
        event_id, first_name, last_name, email, phone, company, job_title,
        status, registration_date, registration_token, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'registered', NOW(), ?, NOW(), NOW())`,
      [eventId, firstName, lastName, email, phone || null, company || null, jobTitle || null, registrationToken],
    )

    res.status(201).json({
      success: true,
      message: "Inscription réussie",
      data: {
        eventTitle: event.title,
        registrationToken,
      },
    })
  } catch (error) {
    console.error("Erreur inscription invité:", error)
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'inscription",
    })
  }
})

module.exports = router
