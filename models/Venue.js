import { DataTypes } from "sequelize"
import { v4 as uuidv4 } from "uuid"
import { sequelize } from "../config/database.js"

const Venue = sequelize.define(
    "Venue",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: () => uuidv4(),
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        street: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING(100),
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        postalCode: {
            type: DataTypes.STRING(20),
            field: "postal_code",
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        facilities: {
            type: DataTypes.TEXT,
        },
        contactName: {
            type: DataTypes.STRING(100),
            field: "contact_name",
        },
        contactEmail: {
            type: DataTypes.STRING(100),
            field: "contact_email",
        },
        contactPhone: {
            type: DataTypes.STRING(20),
            field: "contact_phone",
        },
        description: {
            type: DataTypes.TEXT,
        },
        images: {
            type: DataTypes.TEXT,
            get() {
                const rawValue = this.getDataValue("images")
                return rawValue ? rawValue.split(",") : []
            },
            set(val) {
                this.setDataValue("images", val.join(","))
            },
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: "is_active",
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
        tableName: "venues",
        timestamps: true,
        underscored: true,
    },
)

export default Venue

