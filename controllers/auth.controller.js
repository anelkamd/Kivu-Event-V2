import { User } from "../models/index.js"
import { asyncHandler } from "../middleware/async.middleware.js"
import { AppError } from "../utils/appError.js"
import { generateToken } from "../utils/generateToken.js"
import { Op } from "sequelize"

// @desc    Enregistrer un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  try {
    console.log("Tentative d'enregistrement avec:", req.body)

    const { firstName, lastName, email, password, role } = req.body

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ where: { email } })

    if (userExists) {
      console.log("Email déjà utilisé:", email)
      return next(new AppError("Cet email est déjà utilisé", 400))
    }

    // Créer un nouvel utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || "organizer",
    })

    if (user) {
      console.log("Utilisateur créé avec succès:", user.id)

      // Générer un token JWT
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
    } else {
      console.log("Échec de la création de l'utilisateur")
      return next(new AppError("Données utilisateur invalides", 400))
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error)
    return next(new AppError("Erreur lors de l'enregistrement", 500))
  }
})

// @desc    Authentifier un utilisateur et obtenir un token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  try {
    console.log("Tentative de connexion avec:", req.body)

    const { email, password } = req.body

    // Vérifier si l'email et le mot de passe sont fournis
    if (!email || !password) {
      console.log("Email ou mot de passe manquant")
      return next(new AppError("Veuillez fournir un email et un mot de passe", 400))
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ where: { email } })

    if (!user) {
      console.log("Utilisateur non trouvé:", email)
      return next(new AppError("Email ou mot de passe incorrect", 401))
    }

    console.log("Utilisateur trouvé:", user.id)

    // Vérifier si le mot de passe correspond
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      console.log("Mot de passe incorrect pour:", email)
      return next(new AppError("Email ou mot de passe incorrect", 401))
    }

    console.log("Authentification réussie pour:", email)

    // Générer un token JWT
    const token = generateToken(user.id)

    res.status(200).json({
      success: true,
      token,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la connexion:", error)
    return next(new AppError("Erreur lors de la connexion", 500))
  }
})

// @desc    Obtenir l'utilisateur actuellement connecté
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password"] },
  })

  if (!user) {
    return next(new AppError("Utilisateur non trouvé", 404))
  }

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Mettre à jour les détails de l'utilisateur (nom, email, etc.)
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  try {
    console.log("Tentative de mise à jour des détails pour l'utilisateur:", req.user.id)
    console.log("Données de mise à jour:", req.body)

    const { firstName, lastName, email, phoneNumber } = req.body

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: req.user.id },
        },
      })

      if (existingUser) {
        console.log("Email déjà utilisé par un autre utilisateur:", email)
        return next(new AppError("Cet email est déjà utilisé", 400))
      }
    }

    // Mettre à jour l'utilisateur
    const user = await User.findByPk(req.user.id)

    if (!user) {
      console.log("Utilisateur non trouvé pour la mise à jour:", req.user.id)
      return next(new AppError("Utilisateur non trouvé", 404))
    }

    // Mettre à jour uniquement les champs fournis
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (email) user.email = email
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber

    await user.save()

    console.log("Détails de l'utilisateur mis à jour avec succès:", user.id)

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profileImage: user.profileImage,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour des détails:", error)
    return next(new AppError("Erreur lors de la mise à jour des détails", 500))
  }
})

// @desc    Déconnexion / effacement du cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.status(200).json({
    success: true,
    data: {},
  })
})

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  try {
    console.log("Tentative de mise à jour du mot de passe pour l'utilisateur:", req.user.id)

    const { currentPassword, newPassword } = req.body

    // Vérifier si les mots de passe sont fournis
    if (!currentPassword || !newPassword) {
      console.log("Mot de passe actuel ou nouveau mot de passe manquant")
      return next(new AppError("Veuillez fournir le mot de passe actuel et le nouveau mot de passe", 400))
    }

    // Obtenir l'utilisateur avec le mot de passe
    const user = await User.findByPk(req.user.id)

    if (!user) {
      console.log("Utilisateur non trouvé pour la mise à jour du mot de passe:", req.user.id)
      return next(new AppError("Utilisateur non trouvé", 404))
    }

    // Vérifier si le mot de passe actuel correspond
    const isMatch = await user.matchPassword(currentPassword)

    if (!isMatch) {
      console.log("Mot de passe actuel incorrect pour:", req.user.id)
      return next(new AppError("Mot de passe actuel incorrect", 401))
    }

    // Mettre à jour le mot de passe
    user.password = newPassword
    await user.save()

    console.log("Mot de passe mis à jour avec succès pour:", req.user.id)

    // Générer un nouveau token JWT
    const token = generateToken(user.id)

    res.status(200).json({
      success: true,
      token,
      message: "Mot de passe mis à jour avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe:", error)
    return next(new AppError("Erreur lors de la mise à jour du mot de passe", 500))
  }
})

// @desc    Demander la réinitialisation du mot de passe
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  try {
    console.log("Demande de réinitialisation de mot de passe pour:", req.body.email)

    const { email } = req.body

    // Vérifier si l'email est fourni
    if (!email) {
      console.log("Email manquant pour la réinitialisation du mot de passe")
      return next(new AppError("Veuillez fournir un email", 400))
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ where: { email } })

    if (!user) {
      console.log("Utilisateur non trouvé pour la réinitialisation du mot de passe:", email)
      return next(new AppError("Aucun utilisateur trouvé avec cet email", 404))
    }

    // Générer un token de réinitialisation
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Définir la date d'expiration du token (10 minutes)
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000)

    // Enregistrer le token et la date d'expiration dans la base de données
    user.resetPasswordToken = resetToken
    user.resetPasswordExpire = resetPasswordExpire
    await user.save()

    console.log("Token de réinitialisation généré pour:", email)

    // Dans une application réelle, vous enverriez un email avec le lien de réinitialisation
    // Pour cet exemple, nous renvoyons simplement le token
    res.status(200).json({
      success: true,
      message: "Email de réinitialisation envoyé",
      resetToken, // En production, ne pas renvoyer le token dans la réponse
    })
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation de mot de passe:", error)
    return next(new AppError("Erreur lors de la demande de réinitialisation de mot de passe", 500))
  }
})

// @desc    Réinitialiser le mot de passe
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    console.log("Tentative de réinitialisation de mot de passe avec token:", req.params.token)

    const { token } = req.params
    const { password } = req.body

    // Vérifier si le token et le mot de passe sont fournis
    if (!token || !password) {
      console.log("Token ou mot de passe manquant")
      return next(new AppError("Token ou mot de passe manquant", 400))
    }

    // Trouver l'utilisateur avec le token de réinitialisation valide
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpire: { [Op.gt]: new Date() },
      },
    })

    if (!user) {
      console.log("Token invalide ou expiré:", token)
      return next(new AppError("Token invalide ou expiré", 400))
    }

    // Mettre à jour le mot de passe
    user.password = password
    user.resetPasswordToken = null
    user.resetPasswordExpire = null
    await user.save()

    console.log("Mot de passe réinitialisé avec succès pour:", user.id)

    // Générer un nouveau token JWT
    const jwtToken = generateToken(user.id)

    res.status(200).json({
      success: true,
      token: jwtToken,
      message: "Mot de passe réinitialisé avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error)
    return next(new AppError("Erreur lors de la réinitialisation du mot de passe", 500))
  }
})

