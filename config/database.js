import { Sequelize } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

// Configuration de la connexion à la base de données
export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "mysql",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
})

// Fonction pour tester la connexion
export const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log("Connection has been established successfully.")
    return true
  } catch (error) {
    console.error("Unable to connect to the database:", error)
    return false
  }
}

