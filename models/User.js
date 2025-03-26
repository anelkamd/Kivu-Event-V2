import { DataTypes, Model } from "sequelize"
import bcrypt from "bcryptjs"
import { sequelize } from "../config/database.js"

class User extends Model {
  // Méthode pour comparer les mots de passe
  async comparePassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
  }

  // Méthode pour obtenir le nom complet
  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Le prénom est requis" },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Le nom est requis" },
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: { args: [6, 100], msg: "Le mot de passe doit contenir au moins 6 caractères" },
      },
    },
    role: {
      type: DataTypes.ENUM("admin", "organizer", "participant"),
      defaultValue: "participant",
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "user",
    tableName: "users",
    timestamps: true,
    hooks: {
      // Hacher le mot de passe avant de sauvegarder
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
    },
  },
)

export default User

