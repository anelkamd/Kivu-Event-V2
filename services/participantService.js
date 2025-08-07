import Participant from "../models/Participant.js"
import Event from "../models/Event.js"
import User from "../models/User.js"
import { Op } from "sequelize"

class ParticipantService {
  /**
   * Enregistre un participant à un événement.
   * Peut être un utilisateur connecté (userId fourni) ou un participant anonyme (firstName, lastName, email fournis).
   * @param {string} eventId - L'ID de l'événement.
   * @param {Object} participantData - Données du participant (userId OU firstName, lastName, email).
   */
  async registerParticipant(eventId, participantData) {
    try {
      const { userId, firstName, lastName, email } = participantData

      // Vérifier si l'événement existe
      const event = await Event.findByPk(eventId)
      if (!event) {
        throw new Error("Événement non trouvé.")
      }

      // Vérifier si le participant est déjà enregistré
      let existingParticipant
      if (userId) {
        // Participant connecté
        existingParticipant = await Participant.findOne({
          where: {
            eventId: eventId,
            userId: userId,
          },
        })
      } else if (email) {
        // Participant anonyme (vérifier par email pour cet événement)
        existingParticipant = await Participant.findOne({
          where: {
            eventId: eventId,
            email: email,
            userId: { [Op.is]: null }, // S'assurer que c'est une inscription anonyme
          },
        })
      }

      if (existingParticipant) {
        throw new Error("Vous êtes déjà inscrit à cet événement.")
      }

      // Préparer les données pour la création du participant
      const payload = {
        eventId: eventId,
        status: "registered", // Statut par défaut
      }

      if (userId) {
        payload.userId = userId
        // Si un userId est fourni, on peut récupérer les infos de l'utilisateur
        const user = await User.findByPk(userId)
        if (user) {
          payload.firstName = user.firstName
          payload.lastName = user.lastName
          payload.email = user.email
        }
      } else {
        // Inscription anonyme
        if (!firstName || !lastName || !email) {
          throw new Error("Le nom, prénom et l'email sont requis pour l'inscription anonyme.")
        }
        payload.firstName = firstName
        payload.lastName = lastName
        payload.email = email
        payload.userId = null // S'assurer que userId est explicitement null
      }

      const newParticipant = await Participant.create(payload)
      return newParticipant
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du participant dans le service:", error)
      throw error
    }
  }

  // Vous pouvez ajouter d'autres méthodes ici (ex: getParticipantsByEvent, cancelRegistration, etc.)
}

export default new ParticipantService()
