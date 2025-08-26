import express from "express"
import passport from "../config/passport.js"
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

// Routes de récupération de mot de passe
router.post("/forgot-password", forgotPassword)
router.post("/verify-reset-code", verifyResetCode)
router.post("/reset-password", resetPassword)

// Routes protégées
router.get("/me", protect, getMe)
router.put("/updatedetails", protect, updateDetails)
router.put("/updatepassword", protect, updatePassword)

// Routes d'authentification Google pour modérateurs
router.get("/moderator/google", passport.authenticate("google-moderator", { scope: ["profile", "email"] }))

router.get(
  "/moderator/google/callback",
  passport.authenticate("google-moderator", { failureRedirect: "/moderator/login?error=auth_failed" }),
  (req, res) => {
    // Succès de l'authentification
    const moderator = req.user

    // Générer un token JWT pour le modérateur
    const jwt = require("jsonwebtoken")
    const token = jwt.sign(
      {
        id: moderator.id,
        email: moderator.email,
        type: "moderator",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Rediriger vers le frontend avec le token
    res.redirect(`${process.env.FRONTEND_URL}/moderator/dashboard?token=${token}`)
  },
)

// Route d'activation pour modérateurs
router.get("/moderator/activate", async (req, res) => {
  const { token, email } = req.query

  if (!token || !email) {
    return res.redirect(`${process.env.FRONTEND_URL}/moderator/login?error=invalid_invitation`)
  }

  try {
    const moderatorService = await import("../services/moderatorService.js")
    await moderatorService.default.activateModerator(token, email)

    // Rediriger vers Google OAuth
    res.redirect(`/api/auth/moderator/google?state=${encodeURIComponent(JSON.stringify({ token, email }))}`)
  } catch (error) {
    console.error("Erreur activation modérateur:", error)
    res.redirect(`${process.env.FRONTEND_URL}/moderator/login?error=activation_failed`)
  }
})

// Maintenir la compatibilité avec les anciennes routes
router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword/:token", (req, res, next) => {
  req.body.token = req.params.token
  resetPassword(req, res, next)
})

export default router
