import { DataTypes } from "sequelize"
import { v4 as uuidv4 } from "uuid"
import { sequelize } from "../config/database.js"

const Speaker = sequelize.define(
    "Speaker",
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
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        expertise: {
            type: DataTypes.TEXT,
            get() {
                const rawValue = this.getDataValue("expertise")
                return rawValue ? rawValue.split(",") : []
            },
            set(val) {
                this.setDataValue("expertise", val.join(","))
            },
        },
        company: {
            type: DataTypes.STRING(100),
        },
        jobTitle: {
            type: DataTypes.STRING(100),
            field: "job_title",
        },
        profileImage: {
            type: DataTypes.STRING(255),
            field: "profile_image",
        },
        linkedin: {
            type: DataTypes.STRING(255),
        },
        twitter: {
            type: DataTypes.STRING(255),
        },
        website: {
            type: DataTypes.STRING(255),
        },
        rating: {
            type: DataTypes.FLOAT,
            defaultValue: 5.0,
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
        tableName: "speakers",
        timestamps: true,
        underscored: true,
    },
)

export default Speaker

