import mongoose from "mongoose"

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom du lieu est requis"],
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: [true, "L'adresse est requise"],
      },
      city: {
        type: String,
        required: [true, "La ville est requise"],
      },
      state: String,
      country: {
        type: String,
        required: [true, "Le pays est requis"],
      },
      postalCode: String,
    },
    capacity: {
      type: Number,
      required: [true, "La capacité est requise"],
    },
    facilities: [String],
    contactPerson: {
      name: String,
      email: String,
      phone: String,
    },
    description: String,
    images: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

const Venue = mongoose.model("Venue", venueSchema)

export default Venue

