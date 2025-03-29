import { DataTypes } from "sequelize"
import { v4 as uuidv4 } from "uuid"
import { sequelize } from "../config/database.js"

const Payment = sequelize.define(
    "Payment",
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
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING(3),
            defaultValue: "USD",
        },
        status: {
            type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
            defaultValue: "pending",
        },
        paymentIntentId: {
            type: DataTypes.STRING,
            field: "payment_intent_id",
        },
        paymentMethod: {
            type: DataTypes.STRING(50),
            field: "payment_method",
        },
        receiptUrl: {
            type: DataTypes.STRING,
            field: "receipt_url",
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
        tableName: "payments",
        timestamps: true,
        underscored: true,
    }
)

export default Payment

