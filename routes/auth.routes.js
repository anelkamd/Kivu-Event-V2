import express from "express"
import {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js"
import { googleAuth, googleCallback } from "../controllers/google-auth.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/me", protect, getMe)
router.put("/updatedetails", protect, updateDetails)
router.put("/updatepassword", protect, updatePassword)
router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword/:resettoken", resetPassword)

// Routes Google OAuth
router.get("/google", googleAuth)
router.get("/google/callback", googleCallback)

export default router