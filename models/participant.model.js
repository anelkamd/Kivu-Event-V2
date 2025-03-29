import { DataTypes } from "sequelize"
import { v4 as uuidv4 } from "uuid"
import { sequelize } from "../config/database.js"

const Participant = sequelize.define(
    "Participant",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: () => uuidv4(),
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: "user_id",
            references: {
                model: "users",
                key: "id",
            },
        },
        eventId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: "event_id",
            references: {
                model: "events",
                key: "id",
            },
        },
        registrationDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: "registration_date",
        },
        status: {
            type: DataTypes.ENUM("registered", "attended", "cancelled", "no-show"),
            defaultValue: "registered",
        },
        company: {
            type: DataTypes.STRING(100),
        },
        jobTitle: {
            type: DataTypes.STRING(100),
            field: "job_title",
        },
        dietaryRestrictions: {
            type: DataTypes.STRING(255),
            field: "dietary_restrictions",
        },
        specialRequirements: {
            type: DataTypes.TEXT,
            field: "special_requirements",
        },
        feedbackRating: {
            type: DataTypes.INTEGER,
            field: "feedback_rating",
        },
        feedbackComment: {
            type: DataTypes.TEXT,
            field: "feedback_comment",
        },
        feedbackSubmittedAt: {
            type: DataTypes.DATE,
            field: "feedback_submitted_at",
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
        tableName: "participants",
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ["user_id", "event_id"],
            },
        ],
    },
)

export default Participant

