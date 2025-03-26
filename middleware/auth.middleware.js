import jwt from "jsonwebtoken"
import { asyncHandler } from "./async.middleware.js"
import { AppError } from "../utils/appError.js"
import { User } from "../models/index.js"

// Middleware pour protéger les routes
export const protect = asyncHandler(async (req, res, next) => {
  let token

  // Vérifier si le token est présent dans les headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  } else if (req.cookies && req.cookies.token) {
    // Ou dans les cookies
    token = req.cookies.token
  }

  // Vérifier si le token existe
  if (!token) {
    return next(new AppError("Non autorisé à accéder à cette route", 401))
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Ajouter l'utilisateur à la requête
    const user = await User.findByPk(decoded.id)

    if (!user) {
      return next(new AppError("L'utilisateur associé à ce token n'existe plus", 401))
    }

    req.user = user
    next()
  } catch (err) {
    return next(new AppError("Non autorisé à accéder à cette route", 401))
  }
})

// Middleware pour autoriser certains rôles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Le rôle ${req.user.role} n'est pas autorisé à accéder à cette route`, 403))
    }
    next()
  }
}

