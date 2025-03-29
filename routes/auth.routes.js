import express from "express"
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
} from "../controllers/auth.controller.js"
import { protect } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/logout", logout)
router.get("/me", protect, getMe)
router.put("/updatedetails", protect, updateDetails)
router.put("/updatepassword", protect, updatePassword)
router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword/:token", resetPassword)

export default router

