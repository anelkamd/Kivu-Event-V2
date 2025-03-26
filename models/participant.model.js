import mongoose from "mongoose"

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'utilisateur est requis"],
    },
    events: [
      {
        event: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
          required: true,
        },
        registrationDate: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["registered", "attended", "cancelled", "no-show"],
          default: "registered",
        },
        feedback: {
          rating: {
            type: Number,
            min: 1,
            max: 5,
          },
          comment: String,
          submittedAt: Date,
        },
      },
    ],
    company: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    dietaryRestrictions: String,
    specialRequirements: String,
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

const Participant = mongoose.model("Participant", participantSchema)

export default Participant

