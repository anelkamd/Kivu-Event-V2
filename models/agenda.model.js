import { DataTypes } from "sequelize"
import { v4 as uuidv4 } from "uuid"
import { sequelize } from "../config/database.js"

const AgendaModel = sequelize.define(
    "Agenda",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: () => uuidv4(),
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
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "start_time",
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "end_time",
        },
        speakerId: {
            type: DataTypes.STRING,
            field: "speaker_id",
            references: {
                model: "speakers",
                key: "id",
            },
        },
        location: {
            type: DataTypes.STRING(255),
        },
        type: {
            type: DataTypes.ENUM("presentation", "workshop", "break", "networking", "other"),
            defaultValue: "presentation",
        },
        materials: {
            type: DataTypes.TEXT,
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
        tableName: "agendas",
        timestamps: true,
        underscored: true,
    },
)

export default AgendaModel
