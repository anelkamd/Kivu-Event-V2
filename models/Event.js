import { DataTypes, Model } from "sequelize"
import { sequelize } from "../config/database.js"

class Event extends Model {
  // Méthode pour vérifier si l'événement est complet
  isFull() {
    return this.getParticipants().then((participants) => {
      return participants.length >= this.capacity
    })
  }

  // Méthode pour vérifier si les inscriptions sont ouvertes
  isRegistrationOpen() {
    return this.status === "published" && new Date() <= this.registrationDeadline
  }
}

Event.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Le titre est requis" },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "La description est requise" },
      },
    },
    type: {
      type: DataTypes.ENUM("conference", "seminar", "workshop", "meeting"),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterStartDate(value) {
          if (new Date(value) <= new Date(this.startDate)) {
            throw new Error("La date de fin doit être postérieure à la date de début")
          }
        },
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: "La capacité doit être d'au moins 1" },
      },
    },
    registrationDeadline: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isBeforeStartDate(value) {
          if (new Date(value) > new Date(this.startDate)) {
            throw new Error("La date limite d'inscription doit être antérieure à la date de début")
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "cancelled", "completed"),
      defaultValue: "draft",
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("tags")
        return rawValue ? rawValue.split(",") : []
      },
      set(val) {
        this.setDataValue("tags", val.join(","))
      },
    },
  },
  {
    sequelize,
    modelName: "event",
    tableName: "events",
    timestamps: true,
  },
)

export default Event

