import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const EventModerator = sequelize.define(
  "EventModerator",
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
    moderatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "moderator_id",
    },
    role: {
      type: DataTypes.ENUM("moderateur", "superviseur", "validateur"),
      defaultValue: "moderateur",
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("permissions")
        return (
          rawValue || {
            canValidateTasks: true,
            canAssignTasks: false,
            canManageResources: false,
            canViewReports: true,
            canModerateComments: true,
          }
        )
      },
      set(val) {
        this.setDataValue("permissions", val)
      },
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "assigned_at",
    },
    assignedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "assigned_by",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "event_moderators",
    timestamps: false,
    underscored: true,
  },
)

export default EventModerator
