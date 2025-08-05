import { Op } from "sequelize"
import Event from "../models/Event.js"
import Venue from "../models/Venue.js"

class EventService {
  /**
   * Crée un événement et, si besoin, crée ou retrouve le lieu (venue).
   * @param {Object} eventData - Données reçues du frontend
   */
  async createEvent(eventData) {
    // 1) Préparation des tags
    let processedTags = null
    if (eventData.tags) {
      // Convertit la chaîne de tags en tableau, puis la reconvertit en chaîne pour la BDD
      processedTags = eventData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .join(",")
    }

    // 2) Gestion du lieu (venue)
    let venueId = null

    if (eventData.venue) {
      const venuePayload = {
        name: eventData.venue.name?.trim(),
        street: eventData.venue.street?.trim(), // Le frontend envoie 'street'
        city: eventData.venue.city?.trim(),
        state: eventData.venue.state?.trim(),
        country: eventData.venue.country?.trim(),
        postalCode: eventData.venue.postalCode?.trim(),
        capacity: Number(eventData.venue.capacity) || 0,
        facilities: eventData.venue.facilities || null,
        contactName: eventData.venue.contactName?.trim(),
        contactEmail: eventData.venue.contactEmail?.trim(),
        contactPhone: eventData.venue.contactPhone?.trim(),
        description: eventData.venue.description?.trim(),
        images: eventData.venue.images || null,
      }

      const [venueRecord] = await Venue.findOrCreate({
        where: {
          name: venuePayload.name,
          city: venuePayload.city,
          // Correction: Utiliser 'address' si c'est le nom de la colonne dans votre BDD
          // Si votre BDD a une colonne 'street', alors le problème est dans la définition du modèle Venue
          address: venuePayload.street, // <-- Utilise 'address' pour la clause WHERE
        },
        defaults: {
          ...venuePayload,
          address: venuePayload.street, // <-- Assurez-vous que 'address' est bien mappé pour la création
        },
      })

      venueId = venueRecord.id
    }

    // 3) Mapping des champs
    const payload = {
      title: eventData.title?.trim(),
      description: eventData.description?.trim(),
      type: eventData.type,
      start_date: eventData.startDate,
      end_date: eventData.endDate,
      capacity: Number(eventData.capacity) || 0,
      registration_deadline: eventData.registrationDeadline || null,
      status: eventData.status || "draft",
      price: Number(eventData.price) || 0,
      tags: processedTags, // Utilise la chaîne de tags traitée
      image: eventData.image,
      venue_id: venueId,
    }

    const newEvent = await Event.create(payload)
    return newEvent
  }

  /* ------------------------------------------------------------------ */

  async getAllEvents(filters = {}) {
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
  }

  async getEventById(id) {
    return await Event.findByPk(id, { include: [{ model: Venue, as: "venue" }] })
  }

  async updateEvent(id, updateData) {
    const event = await Event.findByPk(id)
    if (!event) return null

    // 1) Gestion du lieu (venue) si présent
    if (updateData.venue) {
      const venuePayload = {
        name: updateData.venue.name?.trim(),
        street: updateData.venue.street?.trim(),
        city: updateData.venue.city?.trim(),
        state: updateData.venue.state?.trim(),
        country: updateData.venue.country?.trim(),
        postalCode: updateData.venue.postalCode?.trim(),
        capacity: Number(updateData.venue.capacity) || 0,
        facilities: updateData.venue.facilities || null,
        contactName: updateData.venue.contactName?.trim(),
        contactEmail: updateData.venue.contactEmail?.trim(),
        contactPhone: updateData.venue.contactPhone?.trim(),
        description: updateData.venue.description?.trim(),
        images: updateData.venue.images || null,
      }

      const [venueRecord] = await Venue.findOrCreate({
        where: {
          name: venuePayload.name,
          city: venuePayload.city,
          address: venuePayload.street, // <-- Correction ici aussi pour la mise à jour
        },
        defaults: {
          ...venuePayload,
          address: venuePayload.street, // <-- Assurez-vous que 'address' est bien mappé pour la création
        },
      })

      updateData.venue_id = venueRecord.id
    }

    // 2) Mapping des champs camelCase vers snake_case
    if (updateData.startDate) {
      updateData.start_date = updateData.startDate
      delete updateData.startDate
    }

    if (updateData.endDate) {
      updateData.end_date = updateData.endDate
      delete updateData.endDate
    }

    if (updateData.registrationDeadline) {
      updateData.registration_deadline = updateData.registrationDeadline
      delete updateData.registrationDeadline
    }

    // 3) Nettoyage & typage des autres champs
    if (updateData.title) updateData.title = updateData.title.trim()
    if (updateData.description) updateData.description = updateData.description.trim()
    if (updateData.status) updateData.status = updateData.status.trim()

    if (updateData.tags) {
      // Convertit la chaîne de tags en tableau, puis la reconvertit en chaîne pour la BDD
      updateData.tags = updateData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .join(",")
    }

    if (updateData.capacity) updateData.capacity = Number(updateData.capacity)
    if (updateData.price) updateData.price = Number(updateData.price)

    // 4) Mise à jour
    await event.update(updateData)
    return event
  }

  async deleteEvent(id) {
    const event = await Event.findByPk(id)
    if (!event) return false
    await event.destroy()
    return true
  }

  async updateEventStatus(id, status) {
    const event = await Event.findByPk(id)
    if (!event) return null
    event.status = status
    await event.save()
    return event
  }
}

export default new EventService()
