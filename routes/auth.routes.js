import express from "express"
import {
  register,
  login,
  getMe,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
} from "../controllers/auth.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

// Routes d'authentification publiques
router.post("/register", register)
router.post("/login", login)
router.get("/logout", logout)

// Routes de récupération de mot de passe (nouvelles)
router.post("/forgot-password", forgotPassword)
router.post("/verify-reset-code", verifyResetCode)
router.post("/reset-password", resetPassword)

// Routes protégées
router.get("/me", protect, getMe)
router.put("/updatedetails", protect, updateDetails)
router.put("/updatepassword", protect, updatePassword)

// Maintenir la compatibilité avec les anciennes routes
router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword/:token", (req, res, next) => {
  // Adapter l'ancienne route vers la nouvelle logique
  req.body.token = req.params.token
  resetPassword(req, res, next)
})

export default router
