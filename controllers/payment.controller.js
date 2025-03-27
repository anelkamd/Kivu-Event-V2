import { Op } from "sequelize"
import { Payment, User, Event, Participant } from "../models/index.js"
import { asyncHandler } from "../middleware/async.middleware.js"
import { AppError } from "../utils/appError.js"
import Stripe from "stripe"

// Initialiser Stripe avec la clé API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// @desc    Créer une intention de paiement
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res, next) => {
    const { eventId, amount } = req.body

    if (!eventId || !amount) {
        return next(new AppError("Veuillez fournir l'ID de l'événement et le montant", 400))
    }

    // Vérifier si l'événement existe
    const event = await Event.findByPk(eventId)
    if (!event) {
        return next(new AppError(`Événement non trouvé avec l'ID ${eventId}`, 404))
    }

    try {
        // Créer une intention de paiement avec Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "eur",
            metadata: {
                userId: req.user.id,
                eventId,
            },
        })

        // Enregistrer l'intention de paiement dans la base de données
        await Payment.create({
            userId: req.user.id,
            eventId,
            amount,
            status: "pending",
            paymentIntentId: paymentIntent.id,
        })

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        })
    } catch (error) {
        return next(new AppError(`Erreur lors de la création de l'intention de paiement: ${error.message}`, 500))
    }
})

// @desc    Confirmer un paiement
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = asyncHandler(async (req, res, next) => {
    const { eventId, paymentIntentId } = req.body

    if (!eventId || !paymentIntentId) {
        return next(new AppError("Veuillez fournir l'ID de l'événement et l'ID de l'intention de paiement", 400))
    }

    try {
        // Récupérer l'intention de paiement depuis Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

        if (paymentIntent.status !== "succeeded") {
            return next(new AppError("Le paiement n'a pas été complété", 400))
        }

        // Mettre à jour le paiement dans la base de données
        const payment = await Payment.findOne({
            where: {
                paymentIntentId,
                userId: req.user.id,
                eventId,
            },
        })

        if (!payment) {
            return next(new AppError("Paiement non trouvé", 404))
        }

        await payment.update({
            status: "completed",
            paymentMethod: paymentIntent.payment_method_types[0],
            receiptUrl: paymentIntent.charges.data[0]?.receipt_url,
        })

        // Inscrire l'utilisateur à l'événement
        const participant = await Participant.create({
            userId: req.user.id,
            eventId,
            status: "registered",
        })

        res.status(200).json({
            success: true,
            data: {
                payment,
                participant,
            },
        })
    } catch (error) {
        return next(new AppError(`Erreur lors de la confirmation du paiement: ${error.message}`, 500))
    }
})

// @desc    Obtenir tous les paiements
// @route   GET /api/payments
// @access  Private (Admin)
export const getPayments = asyncHandler(async (req, res) => {
    // Construire les options de requête
    const queryOptions = {
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

    // Filtrage par statut
    if (req.query.status) {
        queryOptions.where = {
            ...queryOptions.where,
            status: req.query.status,
        }
    }

    // Filtrage par événement
    if (req.query.eventId) {
        queryOptions.where = {
            ...queryOptions.where,
            eventId: req.query.eventId,
        }
    }

    // Filtrage par utilisateur
    if (req.query.userId) {
        queryOptions.where = {
            ...queryOptions.where,
            userId: req.query.userId,
        }
    }

    // Pagination
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const offset = (page - 1) * limit

    queryOptions.limit = limit
    queryOptions.offset = offset

    // Exécuter la requête
    const { count, rows: payments } = await Payment.findAndCountAll(queryOptions)

    res.status(200).json({
        success: true,
        count: payments.length,
        pagination: {
            total: count,
            page,
            pages: Math.ceil(count / limit),
        },
        data: payments,
    })
})

// @desc    Obtenir les paiements d'un utilisateur
// @route   GET /api/payments/user
// @access  Private
export const getUserPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.findAll({
        where: { userId: req.user.id },
        include: [
            {
                model: Event,
                attributes: ["id", "title", "startDate", "endDate"],
            },
        ],
        order: [["createdAt", "DESC"]],
    })

    res.status(200).json({
        success: true,
        count: payments.length,
        data: payments,
    })
})

// @desc    Obtenir un paiement par ID
// @route   GET /api/payments/:id
// @access  Private (Admin, Owner)
export const getPayment = asyncHandler(async (req, res, next) => {
    const payment = await Payment.findByPk(req.params.id, {
        include: [
            {
                model: User,
                attributes: ["id", "firstName", "lastName", "email"],
            },
            {
                model: Event,
                attributes: ["id", "title", "startDate", "endDate", "status"],
            },
        ],
    })

    if (!payment) {
        return next(new AppError(`Paiement non trouvé avec l'ID ${req.params.id}`, 404))
    }

    // Vérifier si l'utilisateur est autorisé à voir ce paiement
    if (payment.userId !== req.user.id && req.user.role !== "admin") {
        return next(new AppError("Non autorisé à accéder à ce paiement", 403))
    }

    res.status(200).json({
        success: true,
        data: payment,
    })
})

// @desc    Rembourser un paiement
// @route   POST /api/payments/:id/refund
// @access  Private (Admin)
export const refundPayment = asyncHandler(async (req, res, next) => {
    const payment = await Payment.findByPk(req.params.id)

    if (!payment) {
        return next(new AppError(`Paiement non trouvé avec l'ID ${req.params.id}`, 404))
    }

    if (payment.status !== "completed") {
        return next(new AppError("Seuls les paiements complétés peuvent être remboursés", 400))
    }

    try {
        // Effectuer le remboursement via Stripe
        const refund = await stripe.refunds.create({
            payment_intent: payment.paymentIntentId,
        })

        // Mettre à jour le statut du paiement
        await payment.update({
            status: "refunded",
        })

        // Annuler l'inscription du participant
        const participant = await Participant.findOne({
            where: {
                userId: payment.userId,
                eventId: payment.eventId,
            },
        })

        if (participant) {
            await participant.update({
                status: "cancelled",
            })
        }

        res.status(200).json({
            success: true,
            data: {
                payment,
                refund,
            },
        })
    } catch (error) {
        return next(new AppError(`Erreur lors du remboursement: ${error.message}`, 500))
    }
})