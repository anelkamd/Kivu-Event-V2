import jwt from "jsonwebtoken"
import crypto from "crypto"
import { User } from "../models/index.js"
import { asyncHandler } from "../middleware/async.middleware.js"
import { AppError } from "../utils/appError.js"
import { sendEmail } from "../utils/sendEmail.js"
import { Op } from "sequelize"

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

// @desc    Inscription d'un utilisateur
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body

  // Vérifier si l'email existe déjà
  const userExists = await User.findOne({ where: { email } })

  if (userExists) {
    return next(new AppError("Cet email est déjà utilisé", 400))
  }

  // Créer un nouvel utilisateur
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || "participant", // Par défaut, le rôle est 'participant'
  })

  // Générer un token
  const token = generateToken(user.id)

  res.status(201).json({
    success: true,
    token,
    data: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  })
})

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  // Vérifier si l'email et le mot de passe sont fournis
  if (!email || !password) {
    return next(new AppError("Veuillez fournir un email et un mot de passe", 400))
  }

  // Vérifier si l'utilisateur existe
  const user = await User.findOne({
    where: { email },
    attributes: { include: ["password"] }, // Inclure le mot de passe pour la vérification
  })

  if (!user) {
    return next(new AppError("Identifiants invalides", 401))
  }

  // Vérifier si le mot de passe correspond
  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    return next(new AppError("Identifiants invalides", 401))
  }

  // Générer un token
  const token = generateToken(user.id)

  // Exclure le mot de passe de la réponse
  const userData = user.toJSON()
  delete userData.password

  res.status(200).json({
    success: true,
    token,
    data: userData,
  })
})

// @desc    Obtenir l'utilisateur actuel
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id)

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Mettre à jour les informations de l'utilisateur
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
  }

  // Filtrer les champs undefined
  Object.keys(fieldsToUpdate).forEach((key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key])

  const user = await User.findByPk(req.user.id)

  if (!user) {
    return next(new AppError("Utilisateur non trouvé", 404))
  }

  await user.update(fieldsToUpdate)

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { include: ["password"] },
  })

  if (!user) {
    return next(new AppError("Utilisateur non trouvé", 404))
  }

  // Vérifier le mot de passe actuel
  const isMatch = await user.comparePassword(req.body.currentPassword)

  if (!isMatch) {
    return next(new AppError("Mot de passe actuel incorrect", 401))
  }

  // Mettre à jour le mot de passe
  user.password = req.body.newPassword
  await user.save()

  // Générer un nouveau token
  const token = generateToken(user.id)

  res.status(200).json({
    success: true,
    token,
  })
})

// @desc    Mot de passe oublié
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ where: { email: req.body.email } })

  if (!user) {
    return next(new AppError("Aucun utilisateur trouvé avec cet email", 404))
  }

  // Générer un token de réinitialisation
  const resetToken = crypto.randomBytes(20).toString("hex")

  // Hacher le token et le stocker dans la base de données
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

  user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await user.save()

  // Créer l'URL de réinitialisation
  const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/resetpassword/${resetToken}`

  const message = `Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe : \n\n ${resetUrl}`

  try {
    await sendEmail({
      email: user.email,
      subject: "Réinitialisation de mot de passe",
      message,
    })

    res.status(200).json({
      success: true,
      message: "Email envoyé",
    })
  } catch (err) {
    user.resetPasswordToken = null
    user.resetPasswordExpire = null

    await user.save()

    return next(new AppError("L'email n'a pas pu être envoyé", 500))
  }
})

// @desc    Réinitialiser le mot de passe
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Hacher le token
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex")

  const user = await User.findOne({
    where: {
      resetPasswordToken,
      resetPasswordExpire: { [Op.gt]: Date.now() },
    },
  })

  if (!user) {
    return next(new AppError("Token invalide ou expiré", 400))
  }

  // Définir le nouveau mot de passe
  user.password = req.body.password
  user.resetPasswordToken = null
  user.resetPasswordExpire = null

  await user.save()

  // Générer un nouveau token
  const token = generateToken(user.id)

  res.status(200).json({
    success: true,
    token,
  })
})

