import { DataTypes, Model } from "sequelize"
import { sequelize } from "../config/database.js"

class Speaker extends Model {}

Speaker.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Le nom de l'intervenant est requis" },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Veuillez fournir un email valide" },
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expertise: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("expertise")
        return rawValue ? rawValue.split(",") : []
      },
      set(val) {
        this.setDataValue("expertise", val.join(","))
      },
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twitter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 5,
      validate: {
        min: { args: [1], msg: "La note minimale est 1" },
        max: { args: [5], msg: "La note maximale est 5" },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "speaker",
    tableName: "speakers",
    timestamps: true,
  },
)

export default Speaker

