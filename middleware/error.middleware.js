import { AppError } from "../utils/appError.js"

export const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log pour le débogage
  console.error("ERROR DETAILS:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    code: err.code,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  })

  // Erreur Sequelize - Validation
  if (err.name === "SequelizeValidationError") {
    const message = Object.values(err.errors).map((val) => val.message)
    error = new AppError(message, 400)
  }

  // Erreur Sequelize - Unique constraint
  if (err.name === "SequelizeUniqueConstraintError") {
    const message = Object.values(err.errors).map((val) => val.message)
    error = new AppError(message, 400)
  }

  // Erreur Sequelize - Foreign key constraint
  if (err.name === "SequelizeForeignKeyConstraintError") {
    const message = "La ressource référencée n'existe pas"
    error = new AppError(message, 400)
  }

  // Erreur Sequelize - Database error
  if (err.name === "SequelizeDatabaseError") {
    const message = "Erreur de base de données"
    error = new AppError(message, 500)
  }

  // Erreur JWT - Token invalide
  if (err.name === "JsonWebTokenError") {
    const message = "Token non valide"
    error = new AppError(message, 401)
  }

  // Erreur JWT - Token expiré
  if (err.name === "TokenExpiredError") {
    const message = "Token expiré"
    error = new AppError(message, 401)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Erreur serveur",
  })
}

