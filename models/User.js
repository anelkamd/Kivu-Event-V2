import { DataTypes } from "sequelize"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"
import { sequelize } from "../config/database.js"

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: () => uuidv4(),
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
        },
        phoneNumber: {
            type: DataTypes.STRING(20),
            field: "phone_number",
        },
        profileImage: {
            type: DataTypes.STRING(255),
            field: "profile_image",
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: "is_active",
        },
        resetPasswordToken: {
            type: DataTypes.STRING(255),
            field: "reset_password_token",
        },
        resetPasswordExpire: {
            type: DataTypes.DATE,
            field: "reset_password_expire",
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
        tableName: "users",
        timestamps: true,
        underscored: true,
        hooks: {
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

// Méthode pour comparer les mots de passe
User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

export default User

