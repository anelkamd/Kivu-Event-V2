import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const Venue = sequelize.define(
  "Venue",
  {
    id: {
      type: DataTypes.UUID, // Changé de STRING à UUID
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Changé de uuidv4() à DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true, // Ajouté explicitement
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true, // Ajouté explicitement
      field: "postal_code",
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    facilities: {
      type: DataTypes.TEXT,
      allowNull: true, // Ajouté explicitement
      get() {
        const rawValue = this.getDataValue("facilities")
        return rawValue ? rawValue.split(",") : []
      },
      set(val) {
        if (val === null || val === undefined) {
          this.setDataValue("facilities", null)
        } else if (Array.isArray(val)) {
          this.setDataValue("facilities", val.join(","))
        } else if (typeof val === "string") {
          this.setDataValue("facilities", val)
        } else {
          this.setDataValue("facilities", String(val))
        }
      },
    },
    contactName: {
      type: DataTypes.STRING(100),
      allowNull: true, // Ajouté explicitement
      field: "contact_name",
    },
    contactEmail: {
      type: DataTypes.STRING(100),
      allowNull: true, // Ajouté explicitement
      field: "contact_email",
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true, // Ajouté explicitement
      field: "contact_phone",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true, // Ajouté explicitement
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true, // Ajouté explicitement
      get() {
        const rawValue = this.getDataValue("images")
        return rawValue ? rawValue.split(",") : []
      },
      set(val) {
        if (val === null || val === undefined) {
          this.setDataValue("images", null)
        } else if (Array.isArray(val)) {
          this.setDataValue("images", val.join(","))
        } else if (typeof val === "string") {
          this.setDataValue("images", val)
        } else {
          this.setDataValue("images", String(val))
        }
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false, // Ajouté explicitement
      field: "is_active",
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
    tableName: "venues",
    timestamps: true,
    underscored: true,
  },
)

export default Venue
