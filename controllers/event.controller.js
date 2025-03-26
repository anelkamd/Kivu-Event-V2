import { Op } from "sequelize"
import { Event, User, Venue, Speaker, Participant, Agenda } from "../models/index.js"
import { asyncHandler } from "../middleware/async.middleware.js"
import { AppError } from "../utils/appError.js"

// @desc    Créer un nouvel événement
// @route   POST /api/events
// @access  Private (Admin, Organizer)
export const createEvent = asyncHandler(async (req, res) => {
  // Ajouter l'organisateur (utilisateur actuel) à l'événement
  req.body.organizerId = req.user.id

  const event = await Event.create(req.body)

  // Si des intervenants sont fournis, les associer à l'événement
  if (req.body.speakers && Array.isArray(req.body.speakers)) {
    await event.setSpeakers(req.body.speakers)
  }

  // Si un agenda est fourni, créer les éléments d'agenda
  if (req.body.agenda && Array.isArray(req.body.agenda)) {
    const agendaItems = req.body.agenda.map((item) => ({
      ...item,
      eventId: event.id,
    }))

    await Agenda.bulkCreate(agendaItems)
  }

  // Récupérer l'événement avec ses relations
  const createdEvent = await Event.findByPk(event.id, {
    include: [
      { model: User, as: "organizer", attributes: ["id", "firstName", "lastName", "email"] },
      { model: Venue },
      { model: Speaker },
      { model: Agenda },
    ],
  })

  res.status(201).json({
    success: true,
    data: createdEvent,
  })
})

// @desc    Obtenir tous les événements
// @route   GET /api/events
// @access  Public
export const getEvents = asyncHandler(async (req, res) => {
  // Construire les options de requête
  const queryOptions = {
    where: {},
    include: [
      { model: User, as: "organizer", attributes: ["id", "firstName", "lastName"] },
      { model: Venue, attributes: ["id", "name", "city", "country"] },
      { model: Speaker, attributes: ["id", "name", "profileImage"] },
    ],
    order: [["startDate", "ASC"]],
  }

  // Filtrage
  if (req.query.type) {
    queryOptions.where.type = req.query.type
  }

  if (req.query.status) {
    queryOptions.where.status = req.query.status
  }

  // Filtrer par date
  if (req.query.startDate) {
    queryOptions.where.startDate = { [Op.gte]: new Date(req.query.startDate) }
  }

  if (req.query.endDate) {
    queryOptions.where.endDate = { [Op.lte]: new Date(req.query.endDate) }
  }

  // Recherche par mot-clé
  if (req.query.keyword) {
    queryOptions.where[Op.or] = [
      { title: { [Op.like]: `%${req.query.keyword}%` } },
      { description: { [Op.like]: `%${req.query.keyword}%` } },
    ]
  }

  // Pagination
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const offset = (page - 1) * limit

  queryOptions.limit = limit
  queryOptions.offset = offset

  // Exécuter la requête
  const { count, rows: events } = await Event.findAndCountAll(queryOptions)

  res.status(200).json({
    success: true,
    count: events.length,
    pagination: {
      total: count,
      page,
      pages: Math.ceil(count / limit),
    },
    data: events,
  })
})

// @desc    Obtenir un événement par ID
// @route   GET /api/events/:id
// @access  Public
export const getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByPk(req.params.id, {
    include: [
      { model: User, as: "organizer", attributes: ["id", "firstName", "lastName", "email"] },
      { model: Venue },
      { model: Speaker },
      {
        model: User,
        through: {
          model: Participant,
          attributes: ["registrationDate", "status", "feedbackRating", "feedbackComment"],
        },
      },
      {
        model: Agenda,
        include: [{ model: Speaker }],
      },
    ],
  })

  if (!event) {
    return next(new AppError(`Événement non trouvé avec l'ID ${req.params.id}`, 404))
  }

  res.status(200).json({
    success: true,
    data: event,
  })
})

// @desc    Mettre à jour un événement
// @route   PUT /api/events/:id
// @access  Private (Admin, Organizer)
export const updateEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByPk(req.params.id)

  if (!event) {
    return next(new AppError(`Événement non trouvé avec l'ID ${req.params.id}`, 404))
  }

  // Vérifier si l'utilisateur est l'organisateur ou un admin
  if (event.organizerId !== req.user.id && req.user.role !== "admin") {
    return next(new AppError(`L'utilisateur ${req.user.id} n'est pas autorisé à mettre à jour cet événement`, 403))
  }

  // Mettre à jour l'événement
  await event.update(req.body)

  // Si des intervenants sont fournis, mettre à jour les associations
  if (req.body.speakers && Array.isArray(req.body.speakers)) {
    await event.setSpeakers(req.body.speakers)
  }

  // Si un agenda est fourni, mettre à jour les éléments d'agenda
  if (req.body.agenda && Array.isArray(req.body.agenda)) {
    // Supprimer les éléments d'agenda existants
    await Agenda.destroy({ where: { eventId: event.id } })

    // Créer les nouveaux éléments d'agenda
    const agendaItems = req.body.agenda.map((item) => ({
      ...item,
      eventId: event.id,
    }))

    await Agenda.bulkCreate(agendaItems)
  }

  // Récupérer l'événement mis à jour avec ses relations
  const updatedEvent = await Event.findByPk(event.id, {
    include: [
      { model: User, as: "organizer", attributes: ["id", "firstName", "lastName", "email"] },
      { model: Venue },
      { model: Speaker },
      { model: Agenda },
    ],
  })

  res.status(200).json({
    success: true,
    data: updatedEvent,
  })
})

// @desc    Supprimer un événement
// @route   DELETE /api/events/:id
// @access  Private (Admin, Organizer)
export const deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByPk(req.params.id)

  if (!event) {
    return next(new AppError(`Événement non trouvé avec l'ID ${req.params.id}`, 404))
  }

  // Vérifier si l'utilisateur est l'organisateur ou un admin
  if (event.organizerId !== req.user.id && req.user.role !== "admin") {
    return next(new AppError(`L'utilisateur ${req.user.id} n'est pas autorisé à supprimer cet événement`, 403))
  }

  // Supprimer l'événement
  await event.destroy()

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Ajouter un participant à un événement
// @route   POST /api/events/:id/register
// @access  Private
export const registerForEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByPk(req.params.id)

  if (!event) {
    return next(new AppError(`Événement non trouvé avec l'ID ${req.params.id}`, 404))
  }

  // Vérifier si l'événement est complet
  const participantCount = await Participant.count({ where: { eventId: event.id } })
  if (participantCount >= event.capacity) {
    return next(new AppError("Cet événement est complet", 400))
  }

  // Vérifier si l'inscription est encore ouverte
  if (new Date() > new Date(event.registrationDeadline)) {
    return next(new AppError("La date limite d'inscription est dépassée", 400))
  }

  // Vérifier si l'utilisateur est déjà inscrit
  const existingRegistration = await Participant.findOne({
    where: {
      userId: req.user.id,
      eventId: event.id,
    },
  })

  if (existingRegistration) {
    return next(new AppError("Vous êtes déjà inscrit à cet événement", 400))
  }

  // Créer l'inscription
  const registration = await Participant.create({
    userId: req.user.id,
    eventId: event.id,
    ...req.body, // Informations supplémentaires (company, jobTitle, etc.)
  })

  res.status(201).json({
    success: true,
    message: "Inscription réussie",
    data: registration,
  })
})

// @desc    Annuler l'inscription d'un participant à un événement
// @route   DELETE /api/events/:id/register
// @access  Private
export const cancelRegistration = asyncHandler(async (req, res, next) => {
  const registration = await Participant.findOne({
    where: {
      userId: req.user.id,
      eventId: req.params.id,
    },
  })

  if (!registration) {
    return next(new AppError("Vous n'êtes pas inscrit à cet événement", 400))
  }

  // Supprimer l'inscription
  await registration.destroy()

  res.status(200).json({
    success: true,
    message: "Inscription annulée avec succès",
    data: {},
  })
})

// @desc    Soumettre un feedback pour un événement
// @route   POST /api/events/:id/feedback
// @access  Private
export const submitFeedback = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body

  if (!rating) {
    return next(new AppError("Veuillez fournir une note", 400))
  }

  const registration = await Participant.findOne({
    where: {
      userId: req.user.id,
      eventId: req.params.id,
    },
  })

  if (!registration) {
    return next(new AppError("Vous n'êtes pas inscrit à cet événement", 400))
  }

  // Mettre à jour le feedback
  await registration.update({
    feedbackRating: rating,
    feedbackComment: comment,
    feedbackSubmittedAt: new Date(),
  })

  res.status(200).json({
    success: true,
    message: "Feedback soumis avec succès",
    data: registration,
  })
})

