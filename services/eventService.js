import { generateId } from "../utils/helpers.js"

// Simulation d'une base de données en mémoire
const events = []

class EventService {
  // Créer un nouvel événement
  async createEvent(eventData) {
    const newEvent = {
      id: generateId(),
      title: eventData.title.trim(),
      description: eventData.description.trim(),
      type: eventData.type || eventData.category,
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate),
      registrationDeadline: eventData.registrationDeadline ? new Date(eventData.registrationDeadline) : null,
      capacity: Number.parseInt(eventData.capacity) || 100,
      price: Number.parseFloat(eventData.price) || 0,
      status: eventData.status || "draft",
      isPublic: eventData.isPublic !== false,
      tags: eventData.tags ? eventData.tags.split(",").map((tag) => tag.trim()) : [],
      image: eventData.image || null,
      venue: {
        name: eventData.venue?.name || "Lieu à définir",
        address: eventData.venue?.address || "Adresse à définir",
        city: eventData.venue?.city || "Ville à définir",
        country: eventData.venue?.country || "Pays à définir",
        capacity: Number.parseInt(eventData.venue?.capacity) || Number.parseInt(eventData.capacity) || 100,
      },
      organizer: {
        id: eventData.organizerId || "default-organizer",
        name: eventData.organizerName || "Organisateur",
        email: eventData.organizerEmail || "organizer@example.com",
      },
      registrations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    events.push(newEvent)
    return newEvent
  }

  // Récupérer tous les événements avec filtres et pagination
  async getAllEvents(filters = {}) {
    let filteredEvents = [...events]

    // Filtrer par statut
    if (filters.status) {
      filteredEvents = filteredEvents.filter((event) => event.status === filters.status)
    }

    // Filtrer par catégorie
    if (filters.category) {
      filteredEvents = filteredEvents.filter((event) => event.type === filters.category)
    }

    // Recherche textuelle
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      )
    }

    // Trier par date de création (plus récent en premier)
    filteredEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedEvents = filteredEvents.slice(startIndex, endIndex)
    const totalEvents = filteredEvents.length
    const totalPages = Math.ceil(totalEvents / limit)

    return {
      events: paginatedEvents,
      currentPage: page,
      totalPages,
      totalEvents,
      hasNext: endIndex < totalEvents,
      hasPrev: page > 1,
    }
  }

  // Récupérer un événement par ID
  async getEventById(id) {
    return events.find((event) => event.id === id) || null
  }

  // Mettre à jour un événement
  async updateEvent(id, updateData) {
    const eventIndex = events.findIndex((event) => event.id === id)

    if (eventIndex === -1) {
      return null
    }

    const existingEvent = events[eventIndex]

    // Mise à jour des champs
    const updatedEvent = {
      ...existingEvent,
      ...updateData,
      id: existingEvent.id, // Préserver l'ID
      createdAt: existingEvent.createdAt, // Préserver la date de création
      updatedAt: new Date(),
    }

    // Traitement spécial pour les champs complexes
    if (updateData.venue) {
      updatedEvent.venue = {
        ...existingEvent.venue,
        ...updateData.venue,
      }
    }

    if (updateData.tags && typeof updateData.tags === "string") {
      updatedEvent.tags = updateData.tags.split(",").map((tag) => tag.trim())
    }

    events[eventIndex] = updatedEvent
    return updatedEvent
  }

  // Supprimer un événement
  async deleteEvent(id) {
    const eventIndex = events.findIndex((event) => event.id === id)

    if (eventIndex === -1) {
      return false
    }

    events.splice(eventIndex, 1)
    return true
  }

  // Mettre à jour le statut d'un événement
  async updateEventStatus(id, status) {
    const event = events.find((event) => event.id === id)

    if (!event) {
      return null
    }

    event.status = status
    event.updatedAt = new Date()

    return event
  }

  // Obtenir les statistiques des événements
  async getEventStats() {
    const total = events.length
    const published = events.filter((e) => e.status === "published").length
    const draft = events.filter((e) => e.status === "draft").length
    const cancelled = events.filter((e) => e.status === "cancelled").length

    return {
      total,
      published,
      draft,
      cancelled,
    }
  }
}

export default new EventService()
