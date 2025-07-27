import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import morgan from "morgan"
import dotenv from "dotenv"
import colors from "colors"
import path from "path"
import { fileURLToPath } from "url"

// Routes
import eventRoutes from "./routes/event.routes.js"
import authRoutes from "./routes/auth.routes.js"
import venueRoutes from "./routes/venue.routes.js"
import speakerRoutes from "./routes/speaker.routes.js"
import participantRoutes from "./routes/participant.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import userRoutes from "./routes/user.routes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import contactRoutes from "./routes/contact.routes.js"

import { errorHandler } from "./middleware/error.middleware.js"
import { sequelize } from "./config/database.js"

// Setup
dotenv.config()
const app = express()
const PORT = process.env.PORT || 5003

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware de sécurité
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
)

// Configuration CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Middlewares
app.use(compression())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

app.use(express.static(path.join(__dirname, "public")))

// Routes
app.use("/api/events", eventRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/venues", venueRoutes)
app.use("/api/speakers", speakerRoutes)
app.use("/api/participants", participantRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/users", userRoutes)
app.use("/api", uploadRoutes)
app.use("/api/contact", contactRoutes)

// Route de santé
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Route par défaut
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bienvenue sur l'API de Gestion des Événements Kivu Event",
    version: "1.0.0",
    documentation: "/api-docs",
    routes: {
      events: "/api/events",
      auth: "/api/auth",
      venues: "/api/venues",
      speakers: "/api/speakers",
      participants: "/api/participants",
      payments: "/api/payments",
      users: "/api/users",
      contact: "/api/contact",
    },
    authors: "Anelka MD",
    contact: "anelkadevs@gmail.com",
  })
})

// Middleware de gestion des erreurs 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
  })
})

// Gestion des erreurs
app.use(errorHandler)

const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log(colors.cyan.bold("✓ Connexion à la base de données établie avec succès"))

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true })
      console.log(colors.yellow("✓ Modèles synchronisés avec la base de données"))
    }

    app.listen(PORT, () => {
      console.log(
        colors.rainbow(`
      ╔═══════════════════════════════════════════════╗
      ║                                               ║
      ║       KIVU EVENT API - Version 1.0.0          ║
      ║                                               ║
      ╚═══════════════════════════════════════════════╝
      `),
      )
      console.log(colors.green.bold(`✓ Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`))
      console.log(colors.blue(`📧 Service email: ${process.env.SMTP_HOST || "Non configuré"}`))
      console.log(colors.magenta(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`))
    })
  } catch (error) {
    console.error(colors.red.bold("✗ Erreur lors de la connexion à la base de données:"), error.message)
    process.exit(1)
  }
}

// Gestion propre de l'arrêt du serveur
process.on("SIGTERM", () => {
  console.log(colors.yellow("SIGTERM reçu, arrêt du serveur..."))
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log(colors.yellow("SIGINT reçu, arrêt du serveur..."))
  process.exit(0)
})

startServer()

export default app
