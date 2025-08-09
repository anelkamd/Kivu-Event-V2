import { Op } from "sequelize"
import Event from "../models/Event.js"
import Venue from "../models/Venue.js"

class EventService {
  /**
   * Crée un événement et, si besoin, crée ou retrouve le lieu (venue).
   * @param {Object} eventData - Données reçues du frontend
   * @param {string} organizerId - L'ID de l'organisateur (utilisateur connecté)
   */
  async createEvent(eventData, organizerId) {
    try {
      console.log("Service: Données d'événement reçues:", eventData)
      console.log("Service: ID de l'organisateur reçu:", organizerId)

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
          address: eventData.venue.street?.trim(), // Mappe 'street' du frontend à 'address' du modèle
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
      } else {
        console.warn("Aucun nom de lieu fourni, venueId sera null.")
      }

      // 3) Mapping des champs pour la création de l'événement
      const payload = {
        title: eventData.title?.trim(),
        description: eventData.description?.trim(),
        type: eventData.type,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        capacity: Number(eventData.capacity) || 0,
        registrationDeadline: eventData.registrationDeadline || null,
        status: eventData.status || "draft",
        price: Number(eventData.price) || 0,
        tags: processedTags,
        image: eventData.image,
        venueId: venueId,
        organizerId: organizerId, // Assurez-vous que organizerId est bien passé ici
      }

      console.log("Service: Payload final pour Event.create:", payload)

      const newEvent = await Event.create(payload)
      return newEvent
    } catch (error) {
      console.error("Erreur lors de la création de l'événement dans le service:", error)
      throw error
    }
  }

  async getAllEvents(filters = {}) {
    try {
      const { status, type, search, page = 1, limit = 10 } = filters

      const where = {}
      if (status) where.status = status
      if (type) where.type = type
      if (search) {
        where[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }, { description: { [Op.iLike]: `%${search}%` } }]
      }

      const offset = (page - 1) * limit

      const { rows: events, count: totalEvents } = await Event.findAndCountAll({
        where,
        limit,
        offset,
        order: [["created_at", "DESC"]],
        include: [{ model: Venue, as: "venue" }],
      })

      const totalPages = Math.ceil(totalEvents / limit)
      return {
        events,
        currentPage: Number(page),
        totalPages,
        totalEvents,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de tous les événements dans le service:", error)
      throw error
    }
  }

  async getEventById(id) {
    try {
      return await Event.findByPk(id, { include: [{ model: Venue, as: "venue" }] })
    } catch (error) {
      console.error("Erreur lors de la récupération de l'événement par ID dans le service:", error)
      throw error
    }
  }

  async updateEvent(id, updateData) {
    try {
      const event = await Event.findByPk(id)
      if (!event) return null

      // 1) Gestion du lieu (venue) si présent
      if (updateData.venue) {
        const venuePayload = {
          name: updateData.venue.name?.trim(),
          address: updateData.venue.street?.trim(), // Correction ici aussi pour la mise à jour
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

        updateData.venueId = venueRecord.id // Utilisez venueId (camelCase) pour le modèle Sequelize
      }

      // 2) Mapping des champs camelCase vers snake_case pour la mise à jour
      // Sequelize gère normalement le camelCase vers snake_case si `underscored: true` est défini dans le modèle.
      // Cependant, si vous passez des noms de colonnes directement (ex: `start_date`), cela peut causer des problèmes.
      // Assurez-vous que `updateData` utilise les noms de propriétés camelCase de votre modèle.
      const fieldsToUpdate = { ...updateData }

      if (fieldsToUpdate.startDate) {
        fieldsToUpdate.startDate = fieldsToUpdate.startDate // Conservez le nom camelCase
      }
      if (fieldsToUpdate.endDate) {
        fieldsToUpdate.endDate = fieldsToUpdate.endDate // Conservez le nom camelCase
      }
      if (fieldsToUpdate.registrationDeadline) {
        fieldsToUpdate.registrationDeadline = fieldsToUpdate.registrationDeadline // Conservez le nom camelCase
      }

      // 3) Nettoyage & typage des autres champs
      if (fieldsToUpdate.title) fieldsToUpdate.title = fieldsToUpdate.title.trim()
      if (fieldsToUpdate.description) fieldsToUpdate.description = fieldsToUpdate.description.trim()
      if (fieldsToUpdate.status) fieldsToUpdate.status = fieldsToUpdate.status.trim()

      if (fieldsToUpdate.tags) {
        fieldsToUpdate.tags = fieldsToUpdate.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(",")
      }

      if (fieldsToUpdate.capacity) fieldsToUpdate.capacity = Number(fieldsToUpdate.capacity)
      if (fieldsToUpdate.price) fieldsToUpdate.price = Number(fieldsToUpdate.price)

      // 4) Mise à jour
      await event.update(fieldsToUpdate)
      return event
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement dans le service:", error)
      throw error
    }
  }

  async deleteEvent(id) {
    try {
      const event = await Event.findByPk(id)
      if (!event) return false
      await event.destroy()
      return true
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement dans le service:", error)
      throw error
    }
  }

  async updateEventStatus(id, status) {
    try {
      const event = await Event.findByPk(id)
      if (!event) return null
      event.status = status
      await event.save()
      return event
    } catch (error) {
      console.error("Erreur lors du changement de statut dans le service:", error)
      throw error
    }
  }
}

export default new EventService()
