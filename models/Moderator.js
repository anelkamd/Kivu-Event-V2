import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const Moderator = sequelize.define(
  "Moderator",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      field: "google_id",
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "last_name",
    },
    profileImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "profile_image",
    },
    specialization: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "phone_number",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
    invitationToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "invitation_token",
    },
    invitationExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "invitation_expires_at",
    },
    invitedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "invited_by",
    },
    invitedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "invited_at",
    },
    activatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "activated_at",
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login",
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
    tableName: "moderators",
    timestamps: true,
    underscored: true,
  },
)

export default Moderator
