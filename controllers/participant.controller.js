import participantService from "../services/participantService.js"
import { validate } from "uuid" // Pour valider l'ID de l'événement

class ParticipantController {
  async register(req, res) {
    try {
      const { eventId } = req.params
      const { firstName, lastName, email } = req.body
      const userId = req.user ? req.user.id : null // L'ID de l'utilisateur si connecté, sinon null

      if (!validate(eventId)) {
        return res.status(400).json({ success: false, error: "ID d'événement invalide." })
      }

      // Validation des données d'entrée
      if (!userId) {
        // Pour les inscriptions anonymes
        if (!firstName || !lastName || !email) {
          return res.status(400).json({
            success: false,
            error: "Le nom, prénom et l'email sont requis pour l'inscription anonyme.",
          })
        }
        // Validation basique de l'email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).json({ success: false, error: "Format d'email invalide." })
        }
      } else {
        // Pour les utilisateurs connectés, l'email et le nom seront tirés du profil utilisateur
        // Pas de validation supplémentaire ici, car le middleware d'authentification gère l'utilisateur
      }

      const participantData = { userId, firstName, lastName, email }
      const newParticipant = await participantService.registerParticipant(eventId, participantData)

      return res.status(201).json({
        success: true,
        message: "Inscription à l'événement réussie !",
        data: newParticipant,
      })
    } catch (error) {
      console.error("Erreur lors de l'inscription du participant:", error)
      // Gérer les erreurs spécifiques du service
      if (error.message.includes("déjà inscrit")) {
        return res.status(409).json({ success: false, error: error.message })
      }
      return res.status(500).json({
        success: false,
        error: error.message || "Erreur lors de l'inscription du participant",
      })
    }
  }

  // Vous pouvez ajouter d'autres méthodes ici (ex: getParticipantsForEvent, updateParticipantStatus, etc.)
}

export default new ParticipantController()
