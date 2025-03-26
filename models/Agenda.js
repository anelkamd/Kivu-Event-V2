import { DataTypes, Model } from "sequelize"
import { sequelize } from "../config/database.js"

class Agenda extends Model {}

Agenda.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "events",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterStartTime(value) {
          if (new Date(value) <= new Date(this.startTime)) {
            throw new Error("L'heure de fin doit être postérieure à l'heure de début")
          }
        },
      },
    },
    speakerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "speakers",
        key: "id",
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("presentation", "workshop", "break", "networking", "other"),
      defaultValue: "presentation",
    },
    materials: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "agenda",
    tableName: "agendas",
    timestamps: true,
  },
)

export default Agenda

