import { Sequelize } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

// Création de l'instance Sequelize
export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  port: process.env.DB_PORT || 3306,
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

// Fonction pour tester la connexion à la base de données
export const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log("Connexion à la base de données établie avec succès.")
    return true
  } catch (error) {
    console.error("Impossible de se connecter à la base de données:", error)
    return false
  }
}

export default { sequelize, testConnection }

