import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
// Importez les modèles pour les références, mais les associations seront définies dans index.js
import User from "./User.js"
import Event from "./Event.js"

const Payment = sequelize.define(
  "Payment",
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
    amount: {
      type: DataTypes.DECIMAL(10, 2), // Changé de INTEGER à DECIMAL pour la monnaie
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: "USD",
      allowNull: false, // Ajouté explicitement
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
      defaultValue: "pending",
      allowNull: false, // Ajouté explicitement
    },
    paymentIntentId: {
      type: DataTypes.STRING(255), // Ajouté une longueur
      allowNull: true, // Ajouté explicitement
      field: "payment_intent_id",
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true, // Ajouté explicitement
      field: "payment_method",
    },
    receiptUrl: {
      type: DataTypes.STRING(255), // Ajouté une longueur
      allowNull: true, // Ajouté explicitement
      field: "receipt_url",
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
    tableName: "payments",
    timestamps: true,
    underscored: true,
  },
)

// IMPORTANT: Les associations sont maintenant définies dans models/index.js

export default Payment
