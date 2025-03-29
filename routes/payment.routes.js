import express from "express"
import {
    createPayment,
    getUserPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
} from "../controllers/payment.controller.js"
import { protect, authorize } from "../middleware/auth.middleware.js"

const router = express.Router()

router.route("/").post(protect, createPayment).get(protect, getUserPayments)

router
    .route("/:id")
    .get(protect, getPaymentById)
    .put(protect, authorize("admin"), updatePayment)
    .delete(protect, authorize("admin"), deletePayment)

export default router

