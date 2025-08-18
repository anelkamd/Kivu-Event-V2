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
import adminRoutes from "./routes/admin.js"

// Middlewares
import { errorHandler } from "./middleware/error.middleware.js"

// DB
import { sequelize } from "./config/database.js"

// ==============================
// Configuration de l'application
// ==============================
dotenv.config()
const app = express()
const PORT = process.env.PORT || 5003
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Vérification des variables d'environnement critiques
console.log(colors.cyan("🔧 Vérification des variables d'environnement..."))
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? "✅ Configuré" : "❌ Manquant"}`)
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? "✅ Configuré" : "❌ Manquant"}`)
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)

// ==============================
// Sécurité
// ==============================
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "http:", "https:"],
        connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000"],
      },
    },
  }),
)

// ==============================
// CORS - Configuration améliorée
// ==============================
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Permettre les requêtes sans origine (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        console.log(`❌ Origine CORS refusée: ${origin}`)
        callback(null, true) 
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  }),
)

// ==============================
// Middlewares généraux
// ==============================
app.use(compression())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// ==============================
// Fichiers statiques avec CORS amélioré
// ==============================
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET")
    res.header("Access-Control-Allow-Headers", "Content-Type")
    res.header("Cross-Origin-Resource-Policy", "cross-origin")
    next()
  },
  express.static(path.join(__dirname, "uploads")),
)

app.use(express.static(path.join(__dirname, "public")))

// ==============================
// Routes API
// ==============================
app.use("/api/events", eventRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/venues", venueRoutes)
app.use("/api/speakers", speakerRoutes)
app.use("/api/participants", participantRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/users", userRoutes)
app.use("/api", uploadRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/admin", adminRoutes)

// ==============================
// Route de santé
// ==============================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    database: "Connected",
  })
})

// ==============================
// Page d'accueil API
// ==============================
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

// ==============================
// Middleware 404
// ==============================
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
    path: req.originalUrl,
    method: req.method,
  })
})

// ==============================
// Gestion des erreurs
// ==============================
app.use(errorHandler)

// ==============================
// Lancement du serveur
// ==============================
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log(colors.cyan.bold("✓ Connexion à la base de données réussie"))

    // Synchroniser les modèles (attention en production)
    await sequelize.sync({ alter: false })
    console.log(colors.yellow("✓ Modèles synchronisés avec la base de données"))

    app.listen(PORT, () => {
      console.log(colors.green.bold(`🚀 Serveur démarré sur le port ${PORT} [${process.env.NODE_ENV}]`))
      console.log(colors.blue(`🌐 Frontend: ${process.env.FRONTEND_URL || "http://localhost:3000"}`))
      console.log(colors.magenta(`📧 Service email: ${process.env.SMTP_HOST || "Non configuré"}`))
      console.log(colors.cyan(`📁 Uploads: http://localhost:${PORT}/uploads`))
    })
  } catch (error) {
    console.error(colors.red.bold("✗ Erreur DB:"), error.message)
    process.exit(1)
  }
}

// ==============================
// Gestion des signaux système
// ==============================
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
