import { DataTypes } from "sequelize"
import { v4 as uuidv4 } from "uuid"
import { sequelize } from "../config/database.js"

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("conference", "seminar", "workshop", "meeting"),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "start_date",
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "end_date",
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    registrationDeadline: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "registration_deadline",
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "cancelled", "completed"),
      defaultValue: "draft",
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    tags: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue("tags")
        return rawValue ? rawValue.split(",") : []
      },
      set(val) {
        this.setDataValue("tags", Array.isArray(val) ? val.join(",") : "")
      },
    },
    price: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    organizerId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "organizer_id",
      references: {
        model: "users",
        key: "id",
      },
    },
    venueId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "venue_id",
      references: {
        model: "venues",
        key: "id",
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
    tableName: "events",
    timestamps: true,
    underscored: true,
  }
)

export default Event
