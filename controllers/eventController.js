import Event from "../models/Event.js"
import Venue from "../models/Venue.js"
import User from "../models/User.js"
import Participant from "../models/Participant.js"
import { v4 as uuidv4 } from "uuid"
import { Op } from "sequelize"

// Créer un événement
export const createEvent = async (req, res) => {
  try {
    const organizerId = req.user.id
    const eventData = req.body

    console.log("Controller: Données reçues (req.body):", eventData)
    console.log("Controller: ID de l'organisateur (req.user.id):", organizerId)

    // Validation des types d'événements autorisés
    const allowedTypes = ["conference", "seminar", "workshop", "meeting", "other"]
    if (eventData.type && !allowedTypes.includes(eventData.type)) {
      return res.status(400).json({
        success: false,
        error: "Données invalides",
        details: [`Type d'événement invalide. Types autorisés: ${allowedTypes.join(", ")}`],
      })
    }

    // Ajouter l'image si elle a été uploadée
    if (req.file) {
      eventData.image = req.file.path
    }

    // 1) Préparation des tags
    let processedTags = null
    if (eventData.tags) {
      processedTags = eventData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .join(",")
    }

    // 2) Gestion du lieu (venue)
    let venueId = null

    if (eventData.venue && eventData.venue.name) {
      const venuePayload = {
        name: eventData.venue.name?.trim(),
        address: eventData.venue.street?.trim(),
        city: eventData.venue.city?.trim(),
        state: eventData.venue.state?.trim() || null,
        country: eventData.venue.country?.trim(),
        postalCode: eventData.venue.postalCode?.trim() || null,
        capacity: Number(eventData.venue.capacity) || 0,
        facilities: eventData.venue.facilities || null,
        contactName: eventData.venue.contactName?.trim() || null,
        contactEmail: eventData.venue.contactEmail?.trim() || null,
        contactPhone: eventData.venue.contactPhone?.trim() || null,
        description: eventData.venue.description?.trim() || null,
        images: eventData.venue.images || null,
      }

      console.log("Service: venuePayload avant findOrCreate:", venuePayload)

      const [venueRecord] = await Venue.findOrCreate({
        where: {
          name: venuePayload.name,
          city: venuePayload.city,
          address: venuePayload.address,
        },
        defaults: venuePayload,
      })

      venueId = venueRecord.id
    }

    // 3) Mapping des champs pour la création de l'événement
    const payload = {
      id: uuidv4(),
      title: eventData.title?.trim(),
      description: eventData.description?.trim(),
      type: eventData.type || "other", // Valeur par défaut si non spécifiée
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      capacity: Number(eventData.capacity) || 0,
      registrationDeadline: eventData.registrationDeadline || null,
      status: eventData.status || "draft",
      price: Number(eventData.price) || 0,
      tags: processedTags,
      image: eventData.image,
      venueId: venueId,
      organizerId: organizerId,
    }

    console.log("Service: Payload final pour Event.create:", payload)

    const newEvent = await Event.create(payload)

    res.status(201).json({
      success: true,
      message: "Événement créé avec succès",
      data: newEvent,
    })
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error)

    // Gestion des erreurs de validation Sequelize
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((err) => err.message)
      return res.status(400).json({
        success: false,
        error: "Données invalides",
        details: validationErrors,
      })
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'événement",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Récupérer tous les événements (admin/organisateur)
export const getAllEvents = async (req, res) => {
  try {
    const { status, type, search, page = 1, limit = 10 } = req.query

    const where = {}
    if (status) where.status = status
    if (type) where.type = type
    if (search) {
      where[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }, { description: { [Op.iLike]: `%${search}%` } }]
    }

    const offset = (page - 1) * limit

    const { rows: events, count: totalEvents } = await Event.findAndCountAll({
      where,
      limit: Number.parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        { model: Venue, as: "venue" },
        { model: User, as: "organizer", attributes: ["id", "firstName", "lastName", "email"] },
      ],
    })

    // Ajouter le nombre de participants pour chaque événement
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        const participantsCount = await Participant.count({
          where: {
            eventId: event.id,
            status: { [Op.ne]: "cancelled" },
          },
        })
        return {
          ...event.toJSON(),
          participants_count: participantsCount,
        }
      }),
    )

    const totalPages = Math.ceil(totalEvents / limit)

    res.json({
      success: true,
      data: eventsWithParticipants,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalEvents,
        hasNext: Number.parseInt(page) < totalPages,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des événements",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Récupérer les événements publics
export const getPublicEvents = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 12, sort = "date", price } = req.query

    const where = {
      status: "published", // Seulement les événements publiés
    }

    if (type) where.type = type
    if (search) {
      where[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }, { description: { [Op.iLike]: `%${search}%` } }]
    }
    if (price === "free") where.price = 0
    if (price === "paid") where.price = { [Op.gt]: 0 }

    // Définir l'ordre de tri
    let order = [["createdAt", "DESC"]]
    switch (sort) {
      case "date":
        order = [["startDate", "ASC"]]
        break
      case "title":
        order = [["title", "ASC"]]
        break
      case "price":
        order = [["price", "ASC"]]
        break
      case "popularity":
        // Tri par popularité sera géré après la requête
        order = [["createdAt", "DESC"]]
        break
    }

    const offset = (page - 1) * limit

    const { rows: events, count: totalEvents } = await Event.findAndCountAll({
      where,
      limit: Number.parseInt(limit),
      offset,
      order,
      include: [
        { model: Venue, as: "venue" },
        { model: User, as: "organizer", attributes: ["id", "firstName", "lastName", "email", "profileImage"] },
      ],
    })

    // Ajouter le nombre de participants pour chaque événement
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        const participantsCount = await Participant.count({
          where: {
            eventId: event.id,
            status: { [Op.ne]: "cancelled" },
          },
        })
        return {
          ...event.toJSON(),
          participants_count: participantsCount,
        }
      }),
    )

    // Tri par popularité si demandé
    if (sort === "popularity") {
      eventsWithParticipants.sort((a, b) => b.participants_count - a.participants_count)
    }

    const totalPages = Math.ceil(totalEvents / limit)

    res.json({
      success: true,
      data: eventsWithParticipants,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalEvents,
        hasNext: Number.parseInt(page) < totalPages,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des événements publics:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des événements publics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Récupérer un événement par ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params

    const event = await Event.findByPk(id, {
      include: [
        { model: Venue, as: "venue" },
        { model: User, as: "organizer", attributes: ["id", "firstName", "lastName", "email", "profileImage"] },
      ],
    })

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Événement non trouvé",
      })
    }

    // Ajouter le nombre de participants
    const participantsCount = await Participant.count({
      where: {
        eventId: event.id,
        status: { [Op.ne]: "cancelled" },
      },
    })

    const eventWithParticipants = {
      ...event.toJSON(),
      participants_count: participantsCount,
    }

    res.json({
      success: true,
      data: eventWithParticipants,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'événement",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Récupérer mes événements
export const getMyEvents = async (req, res) => {
  try {
    const organizerId = req.user.id
    const { status, type, search, page = 1, limit = 10 } = req.query

    const where = { organizerId }
    if (status) where.status = status
    if (type) where.type = type
    if (search) {
      where[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }, { description: { [Op.iLike]: `%${search}%` } }]
    }

    const offset = (page - 1) * limit

    const { rows: events, count: totalEvents } = await Event.findAndCountAll({
      where,
      limit: Number.parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
      include: [{ model: Venue, as: "venue" }],
    })

    // Ajouter le nombre de participants pour chaque événement
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        const participantsCount = await Participant.count({
          where: {
            eventId: event.id,
            status: { [Op.ne]: "cancelled" },
          },
        })
        return {
          ...event.toJSON(),
          participants_count: participantsCount,
        }
      }),
    )

    const totalPages = Math.ceil(totalEvents / limit)

    res.json({
      success: true,
      data: eventsWithParticipants,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalEvents,
        hasNext: Number.parseInt(page) < totalPages,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de mes événements:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de mes événements",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Récupérer mes participations
export const getMyParticipations = async (req, res) => {
  try {
    const userId = req.user.id
    const { status, page = 1, limit = 10 } = req.query

    const where = { userId }
    if (status) where.status = status

    const offset = (page - 1) * limit

    const { rows: participants, count: totalParticipants } = await Participant.findAndCountAll({
      where,
      limit: Number.parseInt(limit),
      offset,
      order: [["registrationDate", "DESC"]],
      include: [
        {
          model: Event,
          as: "event",
          include: [{ model: Venue, as: "venue" }],
        },
      ],
    })

    const events = participants.map((participant) => ({
      ...participant.event.toJSON(),
      participation: {
        id: participant.id,
        status: participant.status,
        registrationDate: participant.registrationDate,
        attended: participant.attended,
      },
    }))

    const totalPages = Math.ceil(totalParticipants / limit)

    res.json({
      success: true,
      data: events,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalEvents: totalParticipants,
        hasNext: Number.parseInt(page) < totalPages,
        hasPrev: Number.parseInt(page) > 1,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de mes participations:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de mes participations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Mettre à jour un événement
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const event = await Event.findByPk(id)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Événement non trouvé",
      })
    }

    // Vérifier que l'utilisateur est l'organisateur
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à modifier cet événement",
      })
    }

    // Validation du type d'événement si fourni
    const allowedTypes = ["conference", "seminar", "workshop", "meeting", "other"]
    if (updateData.type && !allowedTypes.includes(updateData.type)) {
      return res.status(400).json({
        success: false,
        error: "Données invalides",
        details: [`Type d'événement invalide. Types autorisés: ${allowedTypes.join(", ")}`],
      })
    }

    // Ajouter l'image si elle a été uploadée
    if (req.file) {
      updateData.image = req.file.path
    }

    // Gestion du lieu si présent
    if (updateData.venue) {
      const venuePayload = {
        name: updateData.venue.name?.trim(),
        address: updateData.venue.street?.trim(),
        city: updateData.venue.city?.trim(),
        state: updateData.venue.state?.trim() || null,
        country: updateData.venue.country?.trim(),
        postalCode: updateData.venue.postalCode?.trim() || null,
        capacity: Number(updateData.venue.capacity) || 0,
        facilities: updateData.venue.facilities || null,
        contactName: updateData.venue.contactName?.trim() || null,
        contactEmail: updateData.venue.contactEmail?.trim() || null,
        contactPhone: updateData.venue.contactPhone?.trim() || null,
        description: updateData.venue.description?.trim() || null,
        images: updateData.venue.images || null,
      }

      const [venueRecord] = await Venue.findOrCreate({
        where: {
          name: venuePayload.name,
          city: venuePayload.city,
          address: venuePayload.address,
        },
        defaults: venuePayload,
      })

      updateData.venueId = venueRecord.id
    }

    // Nettoyage des autres champs
    const fieldsToUpdate = { ...updateData }
    if (fieldsToUpdate.title) fieldsToUpdate.title = fieldsToUpdate.title.trim()
    if (fieldsToUpdate.description) fieldsToUpdate.description = fieldsToUpdate.description.trim()
    if (fieldsToUpdate.capacity) fieldsToUpdate.capacity = Number(fieldsToUpdate.capacity)
    if (fieldsToUpdate.price) fieldsToUpdate.price = Number(fieldsToUpdate.price)

    if (fieldsToUpdate.tags) {
      fieldsToUpdate.tags = fieldsToUpdate.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .join(",")
    }

    await event.update(fieldsToUpdate)

    res.json({
      success: true,
      message: "Événement mis à jour avec succès",
      data: event,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'événement:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'événement",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Supprimer un événement
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params

    const event = await Event.findByPk(id)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Événement non trouvé",
      })
    }

    // Vérifier que l'utilisateur est l'organisateur
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à supprimer cet événement",
      })
    }

    await event.destroy()

    res.json({
      success: true,
      message: "Événement supprimé avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'événement",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Changer le statut d'un événement
export const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const event = await Event.findByPk(id)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Événement non trouvé",
      })
    }

    // Vérifier que l'utilisateur est l'organisateur
    if (event.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à modifier cet événement",
      })
    }

    event.status = status
    await event.save()

    res.json({
      success: true,
      message: "Statut de l'événement mis à jour avec succès",
      data: event,
    })
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors du changement de statut",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
