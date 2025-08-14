import { Participant } from "../models/Participant.js"
import { Event } from "../models/Event.js"
import { User } from "../models/User.js"
import { v4 as uuidv4 } from "uuid"

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
      return res.status(400).json({
        success: false,
        message: "Les champs prénom, nom et email sont obligatoires",
      })
    }

    // Vérifier que l'événement existe
    const event = await Event.findByPk(eventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Événement non trouvé",
      })
    }

    // Vérifier si l'événement a encore de la place
    const currentParticipants = await Participant.count({
      where: { eventId },
    })

    if (event.capacity && currentParticipants >= event.capacity) {
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
      return res.status(400).json({
        success: false,
        message: "Vous êtes déjà inscrit à cet événement",
      })
    }

    // Créer le participant
    const participantData = {
      id: uuidv4(),
      eventId,
      userId: req.user?.id || null, // Optionnel si utilisateur connecté
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      position: position?.trim() || null,
      dietaryRestrictions: dietaryRestrictions?.trim() || null,
      specialNeeds: specialNeeds?.trim() || null,
      registrationDate: new Date(),
      status: "registered",
      checkedIn: false,
    }

    const participant = await Participant.create(participantData)

    console.log("✅ Participant créé:", participant.id)

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
      },
    })
  } catch (error) {
    console.error("❌ Erreur inscription participant:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Récupérer tous les participants d'un événement
export const getParticipantsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params

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
      data: { participants },
    })
  } catch (error) {
    console.error("❌ Erreur récupération participants:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des participants",
    })
  }
}

// Récupérer un participant spécifique
export const getParticipantById = async (req, res) => {
  try {
    const { eventId, participantId } = req.params

    const participant = await Participant.findOne({
      where: {
        id: participantId,
        eventId,
      },
      include: [
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
    })
  }
}

// Mettre à jour un participant
export const updateParticipant = async (req, res) => {
  try {
    const { eventId, participantId } = req.params
    const updateData = req.body

    const participant = await Participant.findOne({
      where: {
        id: participantId,
        eventId,
      },
    })

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant non trouvé",
      })
    }

    await participant.update(updateData)

    res.json({
      success: true,
      message: "Participant mis à jour avec succès",
      data: { participant },
    })
  } catch (error) {
    console.error("❌ Erreur mise à jour participant:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du participant",
    })
  }
}

// Supprimer un participant
export const deleteParticipant = async (req, res) => {
  try {
    const { eventId, participantId } = req.params

    const participant = await Participant.findOne({
      where: {
        id: participantId,
        eventId,
      },
    })

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
    })
  }
}

// Check-in d'un participant
export const checkInParticipant = async (req, res) => {
  try {
    const { eventId, participantId } = req.params

    const participant = await Participant.findOne({
      where: {
        id: participantId,
        eventId,
      },
    })

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant non trouvé",
      })
    }

    await participant.update({
      checkedIn: true,
      checkInTime: new Date(),
    })

    res.json({
      success: true,
      message: "Check-in effectué avec succès",
      data: { participant },
    })
  } catch (error) {
    console.error("❌ Erreur check-in participant:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors du check-in",
    })
  }
}
