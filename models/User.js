import { DataTypes } from "sequelize"
import bcrypt from "bcryptjs"
import { sequelize } from "../config/database.js"

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID, // Changé de STRING à UUID
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Changé de uuidv4() à DataTypes.UUIDV4
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "last_name",
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "organizer", "participant"),
      defaultValue: "participant",
      allowNull: false, // Ajouté explicitement
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true, // Ajouté explicitement
      field: "phone_number",
    },
    profileImage: {
      type: DataTypes.STRING(255),
      allowNull: true, // Ajouté explicitement
      field: "profile_image",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false, // Ajouté explicitement
      field: "is_active",
    },
    resetPasswordToken: {
      type: DataTypes.STRING(255),
      allowNull: true, // Ajouté explicitement
      field: "reset_password_token",
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true, // Ajouté explicitement
      field: "reset_password_expire",
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
    tableName: "users",
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password && !user.password.startsWith("$2b$")) {
          const salt = await bcrypt.genSalt(10)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password") && !user.password.startsWith("$2b$")) {
          const salt = await bcrypt.genSalt(10)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
    },
  },
)

// Méthode pour comparer les mots de passe
User.prototype.matchPassword = async function (enteredPassword) {
  try {
    if (!this.password) {
      throw new Error("Mot de passe non défini pour cet utilisateur")
    }
    return await bcrypt.compare(enteredPassword, this.password)
  } catch (error) {
    console.error("Erreur lors de la comparaison des mots de passe:", error)
    return false
  }
}

export default User
