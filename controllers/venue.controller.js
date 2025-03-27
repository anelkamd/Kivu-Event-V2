import { Op } from "sequelize"
import { Venue, Event } from "../models/index.js"
import { asyncHandler } from "../middleware/async.middleware.js"
import { AppError } from "../utils/appError.js"

// @desc    Créer un nouveau lieu
// @route   POST /api/venues
// @access  Private (Admin, Organizer)
export const createVenue = asyncHandler(async (req, res) => {
    const venue = await Venue.create(req.body)

    res.status(201).json({
        success: true,
        data: venue,
    })
})

// @desc    Obtenir tous les lieux
// @route   GET /api/venues
// @access  Public
export const getVenues = asyncHandler(async (req, res) => {
    // Construire les options de requête
    const queryOptions = {
        where: {},
        order: [["name", "ASC"]],
    }

    // Filtrage
    if (req.query.city) {
        queryOptions.where.city = { [Op.like]: `%${req.query.city}%` }
    }

    if (req.query.country) {
        queryOptions.where.country = { [Op.like]: `%${req.query.country}%` }
    }

    if (req.query.capacity) {
        queryOptions.where.capacity = { [Op.gte]: parseInt(req.query.capacity, 10) }
    }

    // Recherche par mot-clé
    if (req.query.keyword) {
        queryOptions.where[Op.or] = [
            { name: { [Op.like]: `%${req.query.keyword}%` } },
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
    const { count, rows: venues } = await Venue.findAndCountAll(queryOptions)

    res.status(200).json({
        success: true,
        count: venues.length,
        pagination: {
            total: count,
            page,
            pages: Math.ceil(count / limit),
        },
        data: venues,
    })
})

// @desc    Obtenir un lieu par ID
// @route   GET /api/venues/:id
// @access  Public
export const getVenue = asyncHandler(async (req, res, next) => {
    const venue = await Venue.findByPk(req.params.id, {
        include: [
            {
                model: Event,
                attributes: ["id", "title", "startDate", "endDate", "status"],
            },
        ],
    })

    if (!venue) {
        return next(new AppError(`Lieu non trouvé avec l'ID ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: venue,
    })
})

// @desc    Mettre à jour un lieu
// @route   PUT /api/venues/:id
// @access  Private (Admin, Organizer)
export const updateVenue = asyncHandler(async (req, res, next) => {
    const venue = await Venue.findByPk(req.params.id)

    if (!venue) {
        return next(new AppError(`Lieu non trouvé avec l'ID ${req.params.id}`, 404))
    }

    // Mettre à jour le lieu
    await venue.update(req.body)

    res.status(200).json({
        success: true,
        data: venue,
    })
})

// @desc    Supprimer un lieu
// @route   DELETE /api/venues/:id
// @access  Private (Admin)
export const deleteVenue = asyncHandler(async (req, res, next) => {
    const venue = await Venue.findByPk(req.params.id)

    if (!venue) {
        return next(new AppError(`Lieu non trouvé avec l'ID ${req.params.id}`, 404))
    }

    // Vérifier si le lieu est utilisé dans des événements
    const eventCount = await Event.count({ where: { venueId: req.params.id } })
    if (eventCount > 0) {
        return next(
            new AppError(
                `Ce lieu ne peut pas être supprimé car il est utilisé dans ${eventCount} événement(s)`,
                400
            )
        )
    }

    // Supprimer le lieu
    await venue.destroy()

    res.status(200).json({
        success: true,
        data: {},
    })
})