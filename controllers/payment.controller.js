import { asyncHandler } from "../middleware/async.middleware.js"
import { Payment, User, Event, Participant } from "../models/index.js"
import { AppError } from "../utils/appError.js"

// @desc    Créer un nouveau paiement
// @route   POST /api/payments
// @access  Private
export const createPayment = asyncHandler(async (req, res, next) => {
    const { eventId, amount, currency, paymentMethod } = req.body
    const userId = req.user.id

    // Vérifier si l'événement existe
    const event = await Event.findByPk(eventId)
    if (!event) {
        return next(new AppError("Événement non trouvé", 404))
    }

    // Vérifier si l'utilisateur est déjà inscrit à l'événement
    const existingParticipant = await Participant.findOne({
        where: { userId, eventId },
    })

    if (!existingParticipant) {
        return next(new AppError("Vous devez d'abord vous inscrire à l'événement", 400))
    }

    // Créer le paiement
    const payment = await Payment.create({
        userId,
        eventId,
        amount,
        currency: currency || "USD",
        paymentMethod,
        status: "pending",
    })

    // Ici, vous pourriez intégrer avec un service de paiement comme Stripe
    // et mettre à jour le statut du paiement en fonction de la réponse

    // Pour cet exemple, nous allons simplement marquer le paiement comme complété
    payment.status = "completed"
    await payment.save()

    res.status(201).json({
        success: true,
        data: payment,
    })
})

// @desc    Obtenir tous les paiements d'un utilisateur
// @route   GET /api/payments
// @access  Private
export const getUserPayments = asyncHandler(async (req, res, next) => {
    const userId = req.user.id

    const payments = await Payment.findAll({
        where: { userId },
        include: [
            {
                model: Event,
                attributes: ["id", "title", "startDate", "endDate"],
            },
        ],
    })

    res.status(200).json({
        success: true,
        count: payments.length,
        data: payments,
    })
})

// @desc    Obtenir un paiement par ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = asyncHandler(async (req, res, next) => {
    const payment = await Payment.findByPk(req.params.id, {
        include: [
            {
                model: User,
                attributes: ["id", "firstName", "lastName", "email"],
            },
            {
                model: Event,
                attributes: ["id", "title", "startDate", "endDate", "price"],
            },
        ],
    })

    if (!payment) {
        return next(new AppError("Paiement non trouvé", 404))
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

// @desc    Mettre à jour un paiement
// @route   PUT /api/payments/:id
// @access  Private (Admin)
export const updatePayment = asyncHandler(async (req, res, next) => {
    // Seul un administrateur peut mettre à jour un paiement
    if (req.user.role !== "admin") {
        return next(new AppError("Non autorisé à mettre à jour les paiements", 403))
    }

    const { status, receiptUrl } = req.body

    let payment = await Payment.findByPk(req.params.id)

    if (!payment) {
        return next(new AppError("Paiement non trouvé", 404))
    }

    payment = await payment.update({
        status,
        receiptUrl,
    })

    res.status(200).json({
        success: true,
        data: payment,
    })
})

// @desc    Supprimer un paiement
// @route   DELETE /api/payments/:id
// @access  Private (Admin)
export const deletePayment = asyncHandler(async (req, res, next) => {
    // Seul un administrateur peut supprimer un paiement
    if (req.user.role !== "admin") {
        return next(new AppError("Non autorisé à supprimer les paiements", 403))
    }

    const payment = await Payment.findByPk(req.params.id)

    if (!payment) {
        return next(new AppError("Paiement non trouvé", 404))
    }

    await payment.destroy()

    res.status(200).json({
        success: true,
        data: {},
    })
})

