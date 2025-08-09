import participantService from "../services/participantService.js"
import { validate } from "uuid" // Pour valider l'ID de l'événement

// Nous allons exporter un objet contenant toutes les méthodes du contrôleur
// au lieu d'une classe par défaut.
const participantController = {
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
  },

  // Méthodes placeholder pour les autres routes
  async getParticipants(req, res) {
    try {
      // Logique pour récupérer tous les participants (avec filtres/pagination si nécessaire)
      // Exemple: const participants = await participantService.getAllParticipants(req.query);
      return res.status(200).json({ success: true, message: "Liste des participants (à implémenter)", data: [] })
    } catch (error) {
      console.error("Erreur lors de la récupération des participants:", error)
      return res.status(500).json({ success: false, error: "Erreur lors de la récupération des participants" })
    }
  },

  async getParticipant(req, res) {
    try {
      const { id } = req.params
      // Logique pour récupérer un participant par ID
      // Exemple: const participant = await participantService.getParticipantById(id);
      return res
        .status(200)
        .json({ success: true, message: `Détails du participant ${id} (à implémenter)`, data: null })
    } catch (error) {
      console.error("Erreur lors de la récupération du participant:", error)
      return res.status(500).json({ success: false, error: "Erreur lors de la récupération du participant" })
    }
  },

  async updateParticipant(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body
      // Logique pour mettre à jour un participant
      // Exemple: const updated = await participantService.updateParticipant(id, updateData);
      return res.status(200).json({ success: true, message: `Participant ${id} mis à jour (à implémenter)` })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du participant:", error)
      return res.status(500).json({ success: false, error: "Erreur lors de la mise à jour du participant" })
    }
  },

  async deleteParticipant(req, res) {
    try {
      const { id } = req.params
      // Logique pour supprimer un participant
      // Exemple: const deleted = await participantService.deleteParticipant(id);
      return res.status(200).json({ success: true, message: `Participant ${id} supprimé (à implémenter)` })
    } catch (error) {
      console.error("Erreur lors de la suppression du participant:", error)
      return res.status(500).json({ success: false, error: "Erreur lors de la suppression du participant" })
    }
  },

  async getUserParticipations(req, res) {
    try {
      const { userId } = req.params
      // Logique pour récupérer les participations d'un utilisateur
      // Exemple: const participations = await participantService.getParticipationsByUserId(userId);
      return res
        .status(200)
        .json({ success: true, message: `Participations de l'utilisateur ${userId} (à implémenter)`, data: [] })
    } catch (error) {
      console.error("Erreur lors de la récupération des participations de l'utilisateur:", error)
      return res
        .status(500)
        .json({ success: false, error: "Erreur lors de la récupération des participations de l'utilisateur" })
    }
  },

  async markAttendance(req, res) {
    try {
      const { id } = req.params
      // Logique pour marquer la présence d'un participant
      // Exemple: const updated = await participantService.markAttendance(id);
      return res.status(200).json({ success: true, message: `Présence du participant ${id} marquée (à implémenter)` })
    } catch (error) {
      console.error("Erreur lors du marquage de la présence:", error)
      return res.status(500).json({ success: false, error: "Erreur lors du marquage de la présence" })
    }
  },
}

// Exportez chaque méthode individuellement
export const {
  register,
  getParticipants,
  getParticipant,
  updateParticipant,
  deleteParticipant,
  getUserParticipations,
  markAttendance,
} = participantController
