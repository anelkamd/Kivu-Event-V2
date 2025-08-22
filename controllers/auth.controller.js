import { User } from "../models/index.js"
import { asyncHandler } from "../middleware/async.middleware.js"
import { AppError } from "../utils/appError.js"
import { generateToken } from "../utils/generateToken.js"
import { Op } from "sequelize"
import emailService from "../services/emailService.js"
import jwt from "jsonwebtoken"

// Stockage temporaire des codes de vérification (en production, utilisez Redis)
const verificationCodes = new Map()

// Générer un code de vérification à 6 chiffres
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

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

// @desc    Demander la réinitialisation du mot de passe - Envoyer le code de vérification
// @route   POST /api/auth/forgot-password
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

    // Générer un code de vérification à 6 chiffres
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Stocker le code temporairement
    verificationCodes.set(email, {
      code: verificationCode,
      expiresAt,
      userId: user.id,
    })

    // Envoyer l'email avec le code
    await sendVerificationEmail(email, verificationCode, user.firstName)

    console.log(`Code de vérification envoyé à ${email}: ${verificationCode}`)

    res.status(200).json({
      success: true,
      message: "Code de vérification envoyé par email",
    })
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation de mot de passe:", error)
    return next(new AppError("Erreur lors de la demande de réinitialisation de mot de passe", 500))
  }
})

// @desc    Vérifier le code de réinitialisation
// @route   POST /api/auth/verify-reset-code
// @access  Public
export const verifyResetCode = asyncHandler(async (req, res, next) => {
  try {
    console.log("Vérification du code de réinitialisation pour:", req.body.email)

    const { email, code } = req.body

    if (!email || !code) {
      return next(new AppError("Email et code requis", 400))
    }

    // Vérifier le code stocké
    const storedData = verificationCodes.get(email)
    if (!storedData) {
      return next(new AppError("Code de vérification non trouvé ou expiré", 400))
    }

    // Vérifier l'expiration
    if (new Date() > storedData.expiresAt) {
      verificationCodes.delete(email)
      return next(new AppError("Code de vérification expiré", 400))
    }

    // Vérifier le code
    if (storedData.code !== code) {
      return next(new AppError("Code de vérification incorrect", 400))
    }

    // Générer un token temporaire pour la réinitialisation
    const resetToken = jwt.sign(
      {
        id: storedData.userId,
        email: email,
        type: "password-reset",
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    )

    // Supprimer le code utilisé
    verificationCodes.delete(email)

    console.log("Code vérifié avec succès pour:", email)

    res.status(200).json({
      success: true,
      token: resetToken,
      message: "Code vérifié avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la vérification du code:", error)
    return next(new AppError("Erreur lors de la vérification du code", 500))
  }
})

// @desc    Réinitialiser le mot de passe avec le token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    console.log("Tentative de réinitialisation de mot de passe avec les données:", req.body)

    const { token, email, password } = req.body

    if (!token || !email || !password) {
      console.log("Données manquantes:", { token: !!token, email: !!email, password: !!password })
      return next(new AppError("Token, email et mot de passe requis", 400))
    }

    // Vérifier le token JWT
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log("Token décodé:", decoded)
    } catch (error) {
      console.log("Erreur de vérification du token:", error.message)
      return next(new AppError("Token invalide ou expiré", 400))
    }

    // Vérifier que c'est bien un token de réinitialisation
    if (decoded.type !== "password-reset") {
      console.log("Type de token incorrect:", decoded.type)
      return next(new AppError("Token invalide", 400))
    }

    // Vérifier que l'email correspond
    if (decoded.email !== email) {
      console.log("Email ne correspond pas:", { decoded: decoded.email, provided: email })
      return next(new AppError("Token invalide pour cet email", 400))
    }

    // Trouver l'utilisateur
    const user = await User.findByPk(decoded.id)
    if (!user) {
      console.log("Utilisateur non trouvé:", decoded.id)
      return next(new AppError("Utilisateur non trouvé", 404))
    }

    // Valider le mot de passe
    if (password.length < 8) {
      return next(new AppError("Le mot de passe doit contenir au moins 8 caractères", 400))
    }

    // Mettre à jour le mot de passe
    user.password = password
    await user.save()

    console.log(`Mot de passe réinitialisé avec succès pour: ${email}`)

    res.status(200).json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error)
    return next(new AppError("Erreur lors de la réinitialisation du mot de passe", 500))
  }
})

// Fonction pour envoyer l'email de vérification
const sendVerificationEmail = async (email, code, firstName) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code de vérification - Kivu Event</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background-color: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #007bff;
                margin: 0;
                font-size: 28px;
            }
            .code-section {
                text-align: center;
                background-color: #e3f2fd;
                padding: 25px;
                border-radius: 8px;
                margin: 25px 0;
            }
            .verification-code {
                font-size: 36px;
                font-weight: bold;
                color: #007bff;
                letter-spacing: 8px;
                background-color: white;
                padding: 15px 25px;
                border-radius: 8px;
                display: inline-block;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                margin: 10px 0;
            }
            .warning {
                background-color: #fff3cd;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #ffc107;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Code de Vérification</h1>
                <p>Réinitialisation de votre mot de passe</p>
            </div>

            <p>Bonjour ${firstName || "Utilisateur"},</p>
            
            <p>Vous avez demandé la réinitialisation de votre mot de passe sur <strong>Kivu Event</strong>.</p>
            
            <div class="code-section">
                <h3>Votre code de vérification :</h3>
                <div class="verification-code">${code}</div>
                <p><small>Ce code est valide pendant 10 minutes</small></p>
            </div>

            <div class="warning">
                <h4>⚠️ Important :</h4>
                <ul>
                    <li>Ne partagez jamais ce code avec personne</li>
                    <li>Ce code expire dans 10 minutes</li>
                    <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                </ul>
            </div>

            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>

            <div class="footer">
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                <p><strong>Kivu Event</strong> - Votre plateforme d'événements</p>
            </div>
        </div>
    </body>
    </html>
  `

  try {
    const result = await emailService.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `🔐 Code de vérification - Kivu Event`,
      html: htmlContent,
    })

    console.log("✅ Email de vérification envoyé:", result.messageId)
    return result
  } catch (error) {
    console.error("❌ Erreur envoi email de vérification:", error)
    throw error
  }
}
