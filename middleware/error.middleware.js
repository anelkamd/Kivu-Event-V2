import { AppError } from "../utils/appError.js"

export const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log pour le développeur
  console.error(err.stack.red)

  // Erreur Sequelize - Validation
  if (err.name === "SequelizeValidationError") {
    const message = err.errors.map((e) => e.message).join(", ")
    error = new AppError(message, 400)
  }

  // Erreur Sequelize - Unique Constraint
  if (err.name === "SequelizeUniqueConstraintError") {
    const message = "Cette valeur existe déjà"
    error = new AppError(message, 400)
  }

  // Erreur Sequelize - Foreign Key
  if (err.name === "SequelizeForeignKeyConstraintError") {
    const message = "Référence invalide"
    error = new AppError(message, 400)
  }

  // Erreur JWT - Token expiré
  if (err.name === "TokenExpiredError") {
    const message = "Token expiré, veuillez vous reconnecter"
    error = new AppError(message, 401)
  }

  // Erreur JWT - Token invalide
  if (err.name === "JsonWebTokenError") {
    const message = "Token invalide, veuillez vous reconnecter"
    error = new AppError(message, 401)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Erreur serveur",
  })
}

