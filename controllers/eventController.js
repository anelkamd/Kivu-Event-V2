import eventService from "../services/eventService.js"
import { validateEventData } from "../utils/validation.js"
import Venue from "../models/Venue.js"

class EventController {
  async createEvent(req, res) {
    try {
      const eventData = req.body
      const userId = req.user ? req.user.id : null // S'assurer que userId est null si req.user n'existe pas

      console.log("Controller: Données reçues (req.body):", eventData)
      console.log("Controller: ID de l'organisateur (req.user.id):", userId)

      const validation = validateEventData(eventData)
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: "Données invalides",
          details: validation.errors,
        })
      }

      const newEvent = await eventService.createEvent(eventData, userId)

      const eventWithVenue = await eventService.getEventById(newEvent.id)

      return res.status(201).json({
        success: true,
        message: "Événement créé avec succès",
        data: eventWithVenue,
      })
    } catch (error) {
      console.error("Erreur lors de la création de l'événement:", error)
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la création de l'événement",
      })
    }
  }

  async getAllEvents(req, res) {
    try {
      const { page = 1, limit = 10, status, type, search } = req.query
      const filters = {
        status,
        type,
        search,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
      }
      const result = await eventService.getAllEvents(filters)
      return res.status(200).json({
        success: true,
        data: result.events,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalEvents: result.totalEvents,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      })
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error)
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la récupération des événements",
      })
    }
  }

  async getEventById(req, res) {
    try {
      const { id } = req.params
      const event = await eventService.getEventById(id, { include: [{ model: Venue, as: "venue" }] })
      if (!event) {
        return res.status(404).json({
          success: false,
          error: "Événement non trouvé",
        })
      }
      return res.status(200).json({
        success: true,
        data: event,
      })
    } catch (error) {
      console.error("Erreur lors de la récupération de l'événement:", error)
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la récupération de l'événement",
      })
    }
  }

  async updateEvent(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body
      const validation = validateEventData(updateData, false)
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: "Données invalides",
          details: validation.errors,
        })
      }
      const updatedEvent = await eventService.updateEvent(id, updateData)
      if (!updatedEvent) {
        return res.status(404).json({
          success: false,
          error: "Événement non trouvé",
        })
      }
      return res.status(200).json({
        success: true,
        message: "Événement mis à jour avec succès",
        data: {
          id: updatedEvent.id,
          title: updatedEvent.title,
          status: updatedEvent.status,
        },
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement:", error)
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la mise à jour de l'événement",
      })
    }
  }

  async deleteEvent(req, res) {
    try {
      const { id } = req.params
      const deleted = await eventService.deleteEvent(id)
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "Événement non trouvé",
        })
      }
      return res.status(200).json({
        success: true,
        message: "Événement supprimé avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement:", error)
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la suppression de l'événement",
      })
    }
  }

  async toggleEventStatus(req, res) {
    try {
      const { id } = req.params
      const { status } = req.body
      if (!["draft", "published", "cancelled"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Statut invalide. Utilisez: draft, published, ou cancelled",
        })
      }
      const updatedEvent = await eventService.updateEventStatus(id, status)
      if (!updatedEvent) {
        return res.status(404).json({
          success: false,
          error: "Événement non trouvé",
        })
      }
      return res.status(200).json({
        success: true,
        message: `Événement ${status === "published" ? "publié" : status === "draft" ? "mis en brouillon" : "annulé"} avec succès`,
        data: {
          id: updatedEvent.id,
          title: updatedEvent.title,
          status: updatedEvent.status,
        },
      })
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error)
      return res.status(500).json({
        success: false,
        error: "Erreur lors du changement de statut",
      })
    }
  }
}

const eventController = new EventController()
export default eventController
