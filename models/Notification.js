import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "user_id",
    },
    moderatorId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "moderator_id",
    },
    type: {
      type: DataTypes.ENUM(
        "task_assigned",
        "task_completed",
        "task_validation_required",
        "task_validated",
        "task_rejected",
        "moderator_invited",
        "resource_conflict",
        "deadline_approaching",
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_read",
    },
    priority: {
      type: DataTypes.ENUM("low", "normal", "high", "urgent"),
      defaultValue: "normal",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "expires_at",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "notifications",
    timestamps: false,
    underscored: true,
  },
)

export default Notification
