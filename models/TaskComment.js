import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const TaskComment = sequelize.define(
  "TaskComment",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "task_id",
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
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("commentaire", "validation", "rejet", "demande_modification"),
      defaultValue: "commentaire",
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("attachments")
        return rawValue ? (Array.isArray(rawValue) ? rawValue : []) : []
      },
      set(val) {
        this.setDataValue("attachments", Array.isArray(val) ? val : [])
      },
    },
    isInternal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_internal",
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
    tableName: "task_comments",
    timestamps: true,
    underscored: true,
  },
)

export default TaskComment
