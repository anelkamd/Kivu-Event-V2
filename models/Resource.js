import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const Resource = sequelize.define(
  "Resource",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "event_id",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("salle", "materiel", "budget", "personnel", "transport", "autre"),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    costPerUnit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      field: "cost_per_unit",
    },
    totalCost: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.quantity * this.costPerUnit
      },
    },
    supplier: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    contactInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "contact_info",
    },
    bookingReference: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "booking_reference",
    },
    status: {
      type: DataTypes.ENUM("disponible", "reserve", "utilise", "indisponible"),
      defaultValue: "disponible",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    tableName: "resources",
    timestamps: true,
    underscored: true,
  },
)

export default Resource
