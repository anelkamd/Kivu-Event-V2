import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const Speaker = sequelize.define(
  "Speaker",
  {
    id: {
      type: DataTypes.UUID, // Changé de STRING à UUID
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Changé de uuidv4() à DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Le nom de l'intervenant est requis" },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Veuillez fournir un email valide" },
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true, // Rendu nullable car souvent optionnel
    },
    expertise: {
      type: DataTypes.TEXT, // Changé de STRING à TEXT pour plus de flexibilité
      allowNull: true, // Ajouté explicitement
      get() {
        const rawValue = this.getDataValue("expertise")
        return rawValue ? rawValue.split(",") : []
      },
      set(val) {
        if (val === null || val === undefined) {
          this.setDataValue("expertise", null)
        } else if (Array.isArray(val)) {
          this.setDataValue("expertise", val.join(","))
        } else if (typeof val === "string") {
          this.setDataValue("expertise", val)
        } else {
          this.setDataValue("expertise", String(val))
        }
      },
    },
    company: {
      type: DataTypes.STRING(100),
      allowNull: true, // Ajouté explicitement
    },
    jobTitle: {
      type: DataTypes.STRING(100),
      allowNull: true, // Ajouté explicitement
      field: "job_title",
    },
    profileImage: {
      type: DataTypes.STRING(255),
      allowNull: true, // Ajouté explicitement
      field: "profile_image",
    },
    linkedin: {
      type: DataTypes.STRING(255),
      allowNull: true, // Ajouté explicitement
    },
    twitter: {
      type: DataTypes.STRING(255),
      allowNull: true, // Ajouté explicitement
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true, // Ajouté explicitement
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 5.0,
      allowNull: true, // Ajouté explicitement
      validate: {
        min: { args: [1], msg: "La note minimale est 1" },
        max: { args: [5], msg: "La note maximale est 5" },
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
    tableName: "speakers",
    timestamps: true,
    underscored: true,
  },
)

export default Speaker
