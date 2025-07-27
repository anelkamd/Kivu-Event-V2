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
import uploadRoutes from "./routes/uploadRoutes.js" // <-- corrigé ici
const contactRoutes = require("./routes/contact")

import { errorHandler } from "./middleware/error.middleware.js"
import { sequelize } from "./config/database.js"

// Setup
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5003
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middlewares
app.use(cors())
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
    },
    authors: "Anelka MD",
    contact: "anelkadevs@gmail.com"
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
    })
  } catch (error) {
    console.error(colors.red.bold("✗ Erreur lors de la connexion à la base de données:"), error.message)
    process.exit(1)
  }
}

startServer()

export default app
