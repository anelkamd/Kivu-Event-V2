import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
import User from "./User.js"
import Event from "./Event.js"

const Participant = sequelize.define(
  "Participant",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // CHANGÉ: Permet que ce champ soit NULL pour les inscriptions anonymes
      field: "user_id",
      references: {
        model: User,
        key: "id",
      },
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "event_id",
      references: {
        model: Event,
        key: "id",
      },
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true, // NOUVEAU: Pour les participants anonymes
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true, // NOUVEAU: Pour les participants anonymes
      field: "last_name",
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true, // NOUVEAU: Pour les participants anonymes
      validate: {
        isEmail: true,
      },
    },
    registrationDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: "registration_date",
    },
    status: {
      type: DataTypes.ENUM("registered", "attended", "cancelled", "no-show"),
      defaultValue: "registered",
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    jobTitle: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "job_title",
    },
    dietaryRestrictions: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "dietary_restrictions",
    },
    specialRequirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "special_requirements",
    },
    feedbackRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "feedback_rating",
      validate: {
        min: { args: [1], msg: "La note minimale est 1" },
        max: { args: [5], msg: "La note maximale est 5" },
      },
    },
    feedbackComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "feedback_comment",
    },
    feedbackSubmittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "feedback_submitted_at",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: "updated_at",
    },
  },
  {
    tableName: "participants",
    timestamps: true,
    underscored: true,
    // L'index unique (user_id, event_id) est supprimé ici car user_id peut être NULL.
    // La gestion de l'unicité pour les participants anonymes (par email) devra être gérée au niveau de l'application.
  },
)

export default Participant
