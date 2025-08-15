import Participant from "../models/Participant.js"
import Event from "../models/Event.js"
import User from "../models/User.js"
import Venue from "../models/Venue.js"
import { v4 as uuidv4 } from "uuid"
import { Op } from "sequelize"

// Inscription d'un participant à un événement
export const registerParticipant = async (req, res) => {
  try {
    const { eventId } = req.params
    const { firstName, lastName, email, phone, company, position, dietaryRestrictions, specialNeeds } = req.body

    console.log("🎯 Inscription participant:", {
      eventId,
      email,
      hasUser: !!req.user,
      body: req.body,
    })

    // Validation des données requises
    if (!firstName || !lastName || !email) {
      console.log("❌ Données manquantes:", { firstName, lastName, email })
      return res.status(400).json({
        success: false,
        message: "Les champs prénom, nom et email sont obligatoires",
      })
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Email invalide:", email)
      return res.status(400).json({
        success: false,
        message: "Format d'email invalide",
      })
    }

    // Vérifier que l'événement existe
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: Venue,
          as: "venue",
        },
        {
          model: User,
          as: "organizer",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    })

    if (!event) {
      console.log("❌ Événement non trouvé:", eventId)
      return res.status(404).json({
        success: false,
        message: "Événement non trouvé",
      })
    }

    console.log("✅ Événement trouvé:", event.title)

    // Vérifier si l'événement est ouvert aux inscriptions
    if (event.status !== "published") {
      console.log("❌ Événement non publié:", event.status)
      return res.status(400).json({
        success: false,
        message: "Les inscriptions ne sont pas ouvertes pour cet événement",
      })
    }

    // Vérifier la date limite d'inscription
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      console.log("❌ Date limite dépassée:", event.registrationDeadline)
      return res.status(400).json({
        success: false,
        message: "La date limite d'inscription est dépassée",
      })
    }

    // Vérifier si l'événement a encore de la place
    const currentParticipants = await Participant.count({
      where: {
        eventId,
        status: {
          [Op.ne]: "cancelled",
        },
      },
    })

    if (event.capacity && currentParticipants >= event.capacity) {
      console.log("❌ Événement complet:", { currentParticipants, capacity: event.capacity })
      return res.status(400).json({
        success: false,
        message: "L'événement est complet",
      })
    }

    // Vérifier si l'utilisateur n'est pas déjà inscrit
    const existingParticipant = await Participant.findOne({
      where: {
        eventId,
        email: email.toLowerCase(),
      },
    })

    if (existingParticipant) {
      console.log("❌ Participant déjà inscrit:", email)
      return res.status(400).json({
        success: false,
        message: "Vous êtes déjà inscrit à cet événement",
      })
    }

    // Créer le participant
    const participantData = {
      id: uuidv4(),
      eventId,
      userId: req.user?.id || null, // NULL pour inscription anonyme
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      jobTitle: position?.trim() || null, // position → jobTitle
      dietaryRestrictions: dietaryRestrictions?.trim() || null,
      specialRequirements: specialNeeds?.trim() || null, // specialNeeds → specialRequirements
      registrationDate: new Date(),
      status: "registered",
      attended: false,
    }

    console.log("📝 Données participant à créer:", participantData)

    const participant = await Participant.create(participantData)

    console.log("✅ Participant créé:", participant.id)

    // Réponse de succès avec informations de l'événement
    res.status(201).json({
      success: true,
      message: "Inscription réussie",
      data: {
        participant: {
          id: participant.id,
          firstName: participant.firstName,
          lastName: participant.lastName,
          email: participant.email,
          status: participant.status,
          registrationDate: participant.registrationDate,
        },
        event: {
          id: event.id,
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          venue: event.venue ? event.venue.name : null,
        },
      },
    })
  } catch (error) {
    console.error("❌ Erreur inscription participant:", error)
    console.error("❌ Stack trace:", error.stack)

    res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription",
      error:
        process.env.NODE_ENV === "development"
          ? {
              message: error.message,
              stack: error.stack,
            }
          : undefined,
    })
  }
}

// Récupérer tous les participants d'un événement
export const getParticipantsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params

    // Vérifier que l'événement existe
    const event = await Event.findByPk(eventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Événement non trouvé",
      })
    }

    const participants = await Participant.findAll({
      where: { eventId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
          required: false,
        },
      ],
      order: [["registrationDate", "DESC"]],
    })

    res.json({
      success: true,
      data: {
        participants,
        total: participants.length,
        event: {
          id: event.id,
          title: event.title,
          capacity: event.capacity,
        },
      },
    })
  } catch (error) {
    console.error("❌ Erreur récupération participants:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des participants",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Récupérer un participant spécifique
export const getParticipantById = async (req, res) => {
  try {
    const { participantId } = req.params

    const participant = await Participant.findByPk(participantId, {
      include: [
        {
          model: Event,
          as: "event",
          include: [
            {
              model: Venue,
              as: "venue",
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
          required: false,
        },
      ],
    })

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant non trouvé",
      })
    }

    res.json({
      success: true,
      data: { participant },
    })
  } catch (error) {
    console.error("❌ Erreur récupération participant:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du participant",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Mettre à jour un participant
export const updateParticipant = async (req, res) => {
  try {
    const { participantId } = req.params
    const updateData = req.body

    const participant = await Participant.findByPk(participantId)

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant non trouvé",
      })
    }

    // Mettre à jour le participant
    await participant.update(updateData)

    // Récupérer le participant mis à jour avec les relations
    const updatedParticipant = await Participant.findByPk(participantId, {
      include: [
        {
          model: Event,
          as: "event",
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
          required: false,
        },
      ],
    })

    res.json({
      success: true,
      message: "Participant mis à jour avec succès",
      data: { participant: updatedParticipant },
    })
  } catch (error) {
    console.error("❌ Erreur mise à jour participant:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du participant",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Supprimer un participant
export const deleteParticipant = async (req, res) => {
  try {
    const { participantId } = req.params

    const participant = await Participant.findByPk(participantId)

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant non trouvé",
      })
    }

    await participant.destroy()

    res.json({
      success: true,
      message: "Participant supprimé avec succès",
    })
  } catch (error) {
    console.error("❌ Erreur suppression participant:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du participant",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Check-in d'un participant
export const checkInParticipant = async (req, res) => {
  try {
    const { participantId } = req.params

    const participant = await Participant.findByPk(participantId)

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant non trouvé",
      })
    }

    // Marquer comme présent
    await participant.update({
      attended: true,
      checkInTime: new Date(),
    })

    res.json({
      success: true,
      message: "Check-in effectué avec succès",
      data: {
        participantId: participant.id,
        attended: participant.attended,
        checkInTime: participant.checkInTime,
      },
    })
  } catch (error) {
    console.error("❌ Erreur check-in participant:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors du check-in",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
