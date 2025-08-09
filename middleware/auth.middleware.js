import jwt from "jsonwebtoken"
import { asyncHandler } from "./async.middleware.js" // Assurez-vous que ce chemin est correct
import { AppError } from "../utils/appError.js" // Assurez-vous que ce chemin est correct
import { User } from "../models/index.js" // Importez votre modèle User

// Middleware pour protéger les routes
export const protect = asyncHandler(async (req, res, next) => {
  let token

  // Vérifier si le token est présent dans les en-têtes d'autorisation (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  } else if (req.cookies && req.cookies.token) {
    // Ou dans les cookies
    token = req.cookies.token
  }

  // Vérifier si le token existe
  if (!token) {
    console.log("DEBUG AUTH: Aucun token trouvé.")
    return next(new AppError("Non autorisé à accéder à cette route (pas de token)", 401))
  }

  try {
    // Vérifier le token
    console.log("DEBUG AUTH: Tentative de vérification du token...")
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("DEBUG AUTH: Token décodé:", decoded)

    // Ajouter l'utilisateur à la requête
    const user = await User.findByPk(decoded.id)

    if (!user) {
      console.log("DEBUG AUTH: Utilisateur non trouvé pour l'ID:", decoded.id)
      return next(new AppError("L'utilisateur associé à ce token n'existe plus", 401))
    }

    req.user = user
    console.log("DEBUG AUTH: req.user défini avec l'utilisateur ID:", req.user.id)
    next()
  } catch (err) {
    console.error("DEBUG AUTH: Erreur lors de la vérification du token:", err.message)
    return next(new AppError("Non autorisé à accéder à cette route (token invalide ou expiré)", 401))
  }
})

// Middleware pour autoriser certains rôles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log("DEBUG AUTH: req.user est indéfini dans authorize.")
      return next(new AppError("Accès refusé: Informations utilisateur manquantes", 403))
    }
    if (!roles.includes(req.user.role)) {
      console.log(`DEBUG AUTH: Rôle ${req.user.role} non autorisé pour cette route. Rôles requis: ${roles.join(", ")}`)
      return next(new AppError(`Le rôle ${req.user.role} n'est pas autorisé à accéder à cette route`, 403))
    }
    next()
  }
}
