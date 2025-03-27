import express from "express"
import {
    createPaymentIntent,
    confirmPayment,
    getPayments,
    getUserPayments,
    getPayment,
    refundPayment,
} from "../controllers/payment.controller.js"
import { protect, authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

// Routes publiques
router.post("/create-intent", protect, createPaymentIntent)
router.post("/confirm", protect, confirmPayment)

// Routes privées (utilisateur)
router.get("/user", protect, getUserPayments)

// Routes privées (admin)
router.get("/", protect, authorize("admin"), getPayments)
router.get("/:id", protect, getPayment)
router.post("/:id/refund", protect, authorize("admin"), refundPayment)

export default router