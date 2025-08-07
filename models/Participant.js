import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
// Importez les modèles pour les références, mais les associations seront définies dans index.js
import User from "./User.js"
import Event from "./Event.js"

const Participant = sequelize.define(
  "Participant",
  {
    id: {
      type: DataTypes.UUID, // Changé de STRING à UUID
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Changé de uuidv4() à DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID, // Changé de STRING à UUID
      allowNull: false,
      field: "user_id",
      references: {
        model: User, // Référence directe au modèle User
        key: "id",
      },
    },
    eventId: {
      type: DataTypes.UUID, // Changé de STRING à UUID
      allowNull: false,
      field: "event_id",
      references: {
        model: Event, // Référence directe au modèle Event
        key: "id",
      },
    },
    registrationDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false, // Ajouté explicitement
      field: "registration_date",
    },
    status: {
      type: DataTypes.ENUM("registered", "attended", "cancelled", "no-show"),
      defaultValue: "registered",
      allowNull: false, // Ajouté explicitement
    },
    company: {
      type: DataTypes.STRING(100), // Ajouté une longueur
      allowNull: true, // Ajouté explicitement
    },
    jobTitle: {
      type: DataTypes.STRING(100), // Ajouté une longueur
      allowNull: true, // Ajouté explicitement
      field: "job_title",
    },
    dietaryRestrictions: {
      type: DataTypes.STRING(255), // Ajouté une longueur
      allowNull: true, // Ajouté explicitement
      field: "dietary_restrictions",
    },
    specialRequirements: {
      type: DataTypes.TEXT,
      allowNull: true, // Ajouté explicitement
      field: "special_requirements",
    },
    feedbackRating: {
      type: DataTypes.INTEGER,
      allowNull: true, // Ajouté explicitement
      field: "feedback_rating",
      validate: {
        min: { args: [1], msg: "La note minimale est 1" },
        max: { args: [5], msg: "La note maximale est 5" },
      },
    },
    feedbackComment: {
      type: DataTypes.TEXT,
      allowNull: true, // Ajouté explicitement
      field: "feedback_comment",
    },
    feedbackSubmittedAt: {
      type: DataTypes.DATE,
      allowNull: true, // Ajouté explicitement
      field: "feedback_submitted_at",
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
    tableName: "participants",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "event_id"], // Utilise les noms de colonnes de la DB
      },
    ],
  },
)

// IMPORTANT: Les associations sont maintenant définies dans models/index.js

export default Participant
