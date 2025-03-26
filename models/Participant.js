import { DataTypes, Model } from "sequelize"
import { sequelize } from "../config/database.js"

class Participant extends Model {}

Participant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "events",
        key: "id",
      },
    },
    registrationDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("registered", "attended", "cancelled", "no-show"),
      defaultValue: "registered",
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dietaryRestrictions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    specialRequirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    feedbackRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: { args: [1], msg: "La note minimale est 1" },
        max: { args: [5], msg: "La note maximale est 5" },
      },
    },
    feedbackComment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    feedbackSubmittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "participant",
    tableName: "participants",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "eventId"],
      },
    ],
  },
)

export default Participant

