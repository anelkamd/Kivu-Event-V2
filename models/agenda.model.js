import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
// Importez les modèles pour les références, mais les associations seront définies dans index.js
import Event from "./Event.js"
import Speaker from "./Speaker.js"

const Agenda = sequelize.define(
  // Renommé de AgendaModel à Agenda pour la cohérence
  "Agenda",
  {
    id: {
      type: DataTypes.UUID, // Changé de STRING à UUID
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Changé de uuidv4() à DataTypes.UUIDV4
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true, // Ajouté explicitement
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "start_time",
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "end_time",
    },
    speakerId: {
      type: DataTypes.UUID, // Changé de STRING à UUID
      allowNull: true, // Un agenda peut ne pas avoir de speaker au début
      field: "speaker_id",
      references: {
        model: Speaker, // Référence directe au modèle Speaker
        key: "id",
      },
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true, // Ajouté explicitement
    },
    type: {
      type: DataTypes.ENUM("presentation", "workshop", "break", "networking", "other"),
      defaultValue: "presentation",
      allowNull: false, // Ajouté explicitement
    },
    materials: {
      type: DataTypes.TEXT,
      allowNull: true, // Ajouté explicitement
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
    tableName: "agendas",
    timestamps: true,
    underscored: true,
  },
)

// IMPORTANT: Les associations sont maintenant définies dans models/index.js

export default Agenda
