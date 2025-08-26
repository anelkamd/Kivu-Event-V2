import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const Task = sequelize.define(
  "Task",
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("basse", "normale", "haute", "critique"),
      defaultValue: "normale",
    },
    status: {
      type: DataTypes.ENUM("a_faire", "en_cours", "en_attente_validation", "validee", "rejetee", "terminee", "annulee"),
      defaultValue: "a_faire",
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "estimated_hours",
    },
    actualHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "actual_hours",
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "start_date",
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "completion_date",
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "created_by",
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "assigned_to",
    },
    moderatorId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "moderator_id",
    },
    validationRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "validation_required",
    },
    validatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "validated_by",
    },
    validatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "validated_at",
    },
    validationNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "validation_notes",
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "rejection_reason",
    },
    requiredResources: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "required_resources",
    },
    budgetAllocated: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      field: "budget_allocated",
    },
    budgetUsed: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      field: "budget_used",
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("tags")
        return rawValue ? (Array.isArray(rawValue) ? rawValue : []) : []
      },
      set(val) {
        this.setDataValue("tags", Array.isArray(val) ? val : [])
      },
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
    progressPercentage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "progress_percentage",
      validate: {
        min: 0,
        max: 100,
      },
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
    tableName: "tasks",
    timestamps: true,
    underscored: true,
  },
)

export default Task
