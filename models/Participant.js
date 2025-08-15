import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const Participant = sequelize.define(
  "Participant",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "event_id",
      references: {
        model: "events",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true, // IMPORTANT: Permet l'inscription anonyme
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
    },
    // Informations personnelles (pour inscription anonyme)
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "last_name",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "job_title",
    },
    // Informations spéciales
    dietaryRestrictions: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "dietary_restrictions",
    },
    specialRequirements: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "special_requirements",
    },
    // Statut et dates
    status: {
      type: DataTypes.ENUM("registered", "confirmed", "attended", "cancelled"),
      defaultValue: "registered",
      allowNull: false,
    },
    registrationDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: "registration_date",
    },
    attended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "check_in_time",
    },
    // Feedback
    feedbackRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "feedback_rating",
      validate: {
        min: 1,
        max: 5,
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
    // Métadonnées
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
    indexes: [
      {
        unique: true,
        fields: ["event_id", "email"], // Un email par événement
        name: "unique_event_email",
      },
      {
        fields: ["event_id"],
        name: "idx_participants_event_id",
      },
      {
        fields: ["user_id"],
        name: "idx_participants_user_id",
      },
      {
        fields: ["status"],
        name: "idx_participants_status",
      },
    ],
  },
)

export default Participant
