import mongoose from "mongoose"

const speakerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom de l'intervenant est requis"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    bio: {
      type: String,
      required: [true, "La biographie est requise"],
    },
    expertise: [String],
    company: String,
    jobTitle: String,
    profileImage: String,
    socialMedia: {
      linkedin: String,
      twitter: String,
      website: String,
    },
    pastEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
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

const Speaker = mongoose.model("Speaker", speakerSchema)

export default Speaker

