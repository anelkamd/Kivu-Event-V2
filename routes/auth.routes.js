import express from "express"
import passport from "passport"
import jwt from "jsonwebtoken"
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

// Route Google OAuth standard
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false
}))

// Route de callback Google
router.get("/google/callback", 
  passport.authenticate("google", { 
    failureRedirect: "/login?error=google_auth_failed",
    session: false 
  }),
  (req, res) => {
    const token = jwt.sign(
      { 
        id: req.user.id,
        email: req.user.email,
        role: req.user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    )

    // Redirection vers le frontend avec le token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`)
  }
)

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
router.get("/moderator/google", passport.authenticate("google-moderator", { scope: ["profile", "email"], session: false }))

router.get(
  "/moderator/google/callback",
  passport.authenticate("google-moderator", { failureRedirect: "/moderator/login?error=auth_failed", session: false }),
  (req, res) => {
    // Succès de l'authentification
    const moderator = req.user

    // Générer un token JWT pour le modérateur
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
