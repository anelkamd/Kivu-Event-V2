import { Op } from "sequelize"
import { Participant, User, Event } from "../models/index.js"
import { asyncHandler } from "../middleware/async.middleware.js"
import { AppError } from "../utils/appError.js"

// @desc    Obtenir tous les participants
// @route   GET /api/participants
// @access  Private (Admin, Organizer)
export const getParticipants = asyncHandler(async (req, res) => {
    // Construire les options de requête
    const queryOptions = {
        where: {},
        include: [
            {
                model: User,
                attributes: ["id", "firstName", "lastName", "email"],
            },
            {
                model: Event,
                attributes: ["id", "title", "startDate", "endDate"],
            },
        ],
        order: [["createdAt", "DESC"]],
    }

    // Filtrage par événement
    if (req.query.eventId) {
        queryOptions.where.eventId = req.query.eventId
    }

    // Filtrage par statut
    if (req.query.status) {
        queryOptions.where.status = req.query.status
    }

    // Pagination
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const offset = (page - 1) * limit

    queryOptions.limit = limit
    queryOptions.offset = offset

    // Exécuter la requête
    const { count, rows: participants } = await Participant.findAndCountAll(queryOptions)

    res.status(200).json({
        success: true,
        count: participants.length,
        pagination: {
            total: count,
            page,
            pages: Math.ceil(count / limit),
        },
        data: participants,
    })
})

// @desc    Obtenir un participant par ID
// @route   GET /api/participants/:id
// @access  Private (Admin, Organizer)
export const getParticipant = asyncHandler(async (req, res, next) => {
    const participant = await Participant.findByPk(req.params.id, {
        include: [
            {
                model: User,
                attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
            },
            {
                model: Event,
                attributes: ["id", "title", "startDate", "endDate", "status"],
            },
        ],
    })

    if (!participant) {
        return next(new AppError(`Participant non trouvé avec l'ID ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: participant,
    })
})

// @desc    Mettre à jour un participant
// @route   PUT /api/participants/:id
// @access  Private (Admin, Organizer)
export const updateParticipant = asyncHandler(async (req, res, next) => {
    const participant = await Participant.findByPk(req.params.id)

    if (!participant) {
        return next(new AppError(`Participant non trouvé avec l'ID ${req.params.id}`, 404))
    }

    // Mettre à jour le participant
    await participant.update(req.body)

    res.status(200).json({
        success: true,
        data: participant,
    })
})

// @desc    Supprimer un participant
// @route   DELETE /api/participants/:id
// @access  Private (Admin)
export const deleteParticipant = asyncHandler(async (req, res, next) => {
    const participant = await Participant.findByPk(req.params.id)

    if (!participant) {
        return next(new AppError(`Participant non trouvé avec l'ID ${req.params.id}`, 404))
    }

    // Supprimer le participant
    await participant.destroy()

    res.status(200).json({
        success: true,
        data: {},
    })
})

// @desc    Obtenir les participants d'un utilisateur
// @route   GET /api/participants/user/:userId
// @access  Private
export const getUserParticipations = asyncHandler(async (req, res) => {
    const participants = await Participant.findAll({
        where: { userId: req.params.userId },
        include: [
            {
                model: Event,
                attributes: ["id", "title", "startDate", "endDate", "status"],
            },
        ],
    })

    res.status(200).json({
        success: true,
        count: participants.length,
        data: participants,
    })
})

// @desc    Marquer un participant comme présent
// @route   PUT /api/participants/:id/attend
// @access  Private (Admin, Organizer)
export const markAttendance = asyncHandler(async (req, res, next) => {
    const participant = await Participant.findByPk(req.params.id)

    if (!participant) {
        return next(new AppError(`Participant non trouvé avec l'ID ${req.params.id}`, 404))
    }

    // Mettre à jour le statut du participant
    await participant.update({ status: "attended" })

    res.status(200).json({
        success: true,
        data: participant,
    })
})