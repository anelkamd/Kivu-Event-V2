import jwt from "jsonwebtoken"
import User from "../models/User.js"

// Middleware d'authentification obligatoire
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      console.log("❌ Aucun token fourni")
      return res.status(401).json({
        success: false,
        message: "Token d'accès requis",
      })
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET non configuré")
      return res.status(500).json({
        success: false,
        message: "Erreur de configuration du serveur",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("✅ Token décodé:", { userId: decoded.id, email: decoded.email })

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findByPk(decoded.id)
    if (!user) {
      console.log("❌ Utilisateur non trouvé:", decoded.id)
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
      })
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }

    next()
  } catch (error) {
    console.error("❌ Erreur authentification:", error.message)

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expiré",
      })
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token invalide",
      })
    }

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification du token",
    })
  }
}

// Alias pour compatibilité avec les routes existantes
export const protect = authenticateToken

// Middleware d'authentification optionnelle (pour inscription anonyme)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      console.log("ℹ️ Aucun token fourni - accès anonyme autorisé")
      req.user = null
      return next()
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET non configuré")
      req.user = null
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("✅ Token optionnel décodé:", { userId: decoded.id, email: decoded.email })

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findByPk(decoded.id)
    if (!user) {
      console.log("⚠️ Utilisateur non trouvé pour token optionnel:", decoded.id)
      req.user = null
      return next()
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }

    console.log("✅ Utilisateur authentifié optionnellement:", req.user.email)
    next()
  } catch (error) {
    console.log("ℹ️ Erreur authentification optionnelle (ignorée):", error.message)
    req.user = null
    next()
  }
}

// Middleware pour vérifier les rôles
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Permissions insuffisantes",
      })
    }

    next()
  }
}

// Alias pour compatibilité
export const authorize = requireRole
