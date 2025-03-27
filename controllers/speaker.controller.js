import { Op } from "sequelize"
import { Speaker, Event } from "../models/index.js"
import { asyncHandler } from "../middleware/async.middleware.js"
import { AppError } from "../utils/appError.js"

// @desc    Créer un nouvel intervenant
// @route   POST /api/speakers
// @access  Private (Admin, Organizer)
export const createSpeaker = asyncHandler(async (req, res) => {
    const speaker = await Speaker.create(req.body)

    res.status(201).json({
        success: true,
        data: speaker,
    })
})

// @desc    Obtenir tous les intervenants
// @route   GET /api/speakers
// @access  Public
export const getSpeakers = asyncHandler(async (req, res) => {
    // Construire les options de requête
    const queryOptions = {
        where: {},
        order: [["name", "ASC"]],
    }

    // Filtrage
    if (req.query.expertise) {
        queryOptions.where.expertise = { [Op.like]: `%${req.query.expertise}%` }
    }

    // Recherche par mot-clé
    if (req.query.keyword) {
        queryOptions.where[Op.or] = [
            { name: { [Op.like]: `%${req.query.keyword}%` } },
            { bio: { [Op.like]: `%${req.query.keyword}%` } },
            { company: { [Op.like]: `%${req.query.keyword}%` } },
        ]
    }

    // Pagination
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const offset = (page - 1) * limit

    queryOptions.limit = limit
    queryOptions.offset = offset

    // Exécuter la requête
    const { count, rows: speakers } = await Speaker.findAndCountAll(queryOptions)

    res.status(200).json({
        success: true,
        count: speakers.length,
        pagination: {
            total: count,
            page,
            pages: Math.ceil(count / limit),
        },
        data: speakers,
    })
})

// @desc    Obtenir un intervenant par ID
// @route   GET /api/speakers/:id
// @access  Public
export const getSpeaker = asyncHandler(async (req, res, next) => {
    const speaker = await Speaker.findByPk(req.params.id, {
        include: [
            {
                model: Event,
                attributes: ["id", "title", "startDate", "endDate", "status"],
                through: { attributes: [] },
            },
        ],
    })

    if (!speaker) {
        return next(new AppError(`Intervenant non trouvé avec l'ID ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: speaker,
    })
})

// @desc    Mettre à jour un intervenant
// @route   PUT /api/speakers/:id
// @access  Private (Admin, Organizer)
export const updateSpeaker = asyncHandler(async (req, res, next) => {
    const speaker = await Speaker.findByPk(req.params.id)

    if (!speaker) {
        return next(new AppError(`Intervenant non trouvé avec l'ID ${req.params.id}`, 404))
    }

    // Mettre à jour l'intervenant
    await speaker.update(req.body)

    res.status(200).json({
        success: true,
        data: speaker,
    })
})

// @desc    Supprimer un intervenant
// @route   DELETE /api/speakers/:id
// @access  Private (Admin)
export const deleteSpeaker = asyncHandler(async (req, res, next) => {
    const speaker = await Speaker.findByPk(req.params.id)

    if (!speaker) {
        return next(new AppError(`Intervenant non trouvé avec l'ID ${req.params.id}`, 404))
    }

    // Supprimer l'intervenant
    await speaker.destroy()

    res.status(200).json({
        success: true,
        data: {},
    })
})