import Event from "../models/Event.js"
import { Op } from "sequelize"
import { generateId } from "../utils/helpers.js" // si besoin

class EventService {
  async createEvent(eventData) {
    // Générer un ID uniquement si tu veux override, sinon Sequelize le fait avec uuidv4
    // Ici on laisse Sequelize gérer l'id

    // Sequelize gère le setter/getter pour tags, donc on peut passer un tableau
    // Assure-toi que tags est bien un tableau ou undefined
    if (eventData.tags && typeof eventData.tags === "string") {
      eventData.tags = eventData.tags.split(",").map((t) => t.trim())
    }

    // Créer l'événement
    const newEvent = await Event.create(eventData)
    return newEvent
  }

  async getAllEvents(filters = {}) {
    const { status, type, search, page = 1, limit = 10 } = filters

    const where = {}

    if (status) where.status = status
    if (type) where.type = type
    if (search) {
      // Recherche sur le titre ou description (ILIKE pour Postgres, à adapter selon ta DB)
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ]
    }

    const offset = (page - 1) * limit

    const { rows: events, count: totalEvents } = await Event.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
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
    return await Event.findByPk(id)
  }

  async updateEvent(id, updateData) {
    const event = await Event.findByPk(id)
    if (!event) return null

    if (updateData.tags && typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map((t) => t.trim())
    }

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
