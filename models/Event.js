import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
// Importez les modèles pour les références, mais les associations seront définies dans index.js
import Venue from "./Venue.js"
import User from "./User.js"

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.UUID, // Changé de STRING à UUID
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Changé de uuidv4() à DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("conference", "seminar", "workshop", "meeting", "other"), // Ajouté "other" pour flexibilité
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "start_date",
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "end_date",
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    registrationDeadline: {
      type: DataTypes.DATE,
      allowNull: true, // Corrigé: Permet que ce champ soit NULL
      field: "registration_deadline",
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "cancelled", "completed"),
      defaultValue: "draft",
      allowNull: false, // Ajouté explicitement
    },
    price: {
      type: DataTypes.DECIMAL(10, 2), // Corrigé: Changé de INTEGER à DECIMAL pour la monnaie
      defaultValue: 0.0,
      allowNull: false,
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true, // Les tags peuvent être NULL
      get() {
        const rawValue = this.getDataValue("tags")
        return rawValue ? rawValue.split(",") : []
      },
      set(val) {
        if (val === null || val === undefined) {
          this.setDataValue("tags", null) // Gère explicitement null/undefined
        } else if (Array.isArray(val)) {
          this.setDataValue("tags", val.join(","))
        } else if (typeof val === "string") {
          this.setDataValue("tags", val)
        } else {
          this.setDataValue("tags", String(val))
        }
      },
    },
    image: {
      type: DataTypes.STRING(255), // URL de l'image
      allowNull: true, // L'image peut être NULL
    },
    venueId: {
      type: DataTypes.UUID, // Changé de STRING à UUID
      allowNull: true, // Le lieu peut être optionnel
      field: "venue_id",
      references: {
        model: Venue, // Référence directe au modèle Venue
        key: "id",
      },
    },
    organizerId: {
      type: DataTypes.UUID, // Changé de STRING à UUID
      allowNull: false, // L'organisateur est obligatoire
      field: "organizer_id",
      references: {
        model: User, // Référence directe au modèle User
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false, // Ajouté explicitement
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false, // Ajouté explicitement
      field: "updated_at",
    },
  },
  {
    tableName: "events",
    timestamps: true,
    underscored: true,
  },
)

// IMPORTANT: Les associations sont maintenant définies dans models/index.js
// Supprimé: Event.belongsTo(Venue, { foreignKey: "venue_id", as: "venue" })
// Supprimé: Event.belongsTo(User, { foreignKey: "organizer_id", as: "organizer" })

export default Event
