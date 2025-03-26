import mongoose from "mongoose"

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
    },
    type: {
      type: String,
      enum: ["conference", "seminar", "workshop", "meeting"],
      required: [true, "Le type d'événement est requis"],
    },
    startDate: {
      type: Date,
      required: [true, "La date de début est requise"],
    },
    endDate: {
      type: Date,
      required: [true, "La date de fin est requise"],
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: [true, "Le lieu est requis"],
    },
    capacity: {
      type: Number,
      required: [true, "La capacité est requise"],
    },
    registrationDeadline: {
      type: Date,
      required: [true, "La date limite d'inscription est requise"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'organisateur est requis"],
    },
    speakers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Speaker",
      },
    ],
    agenda: [
      {
        title: String,
        description: String,
        startTime: Date,
        endTime: Date,
        speaker: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Speaker",
        },
      },
    ],
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Participant",
      },
    ],
    tags: [String],
    image: String,
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

// Méthode pour vérifier si l'événement est complet
eventSchema.methods.isFull = function () {
  return this.participants.length >= this.capacity
}

// Méthode pour vérifier si les inscriptions sont ouvertes
eventSchema.methods.isRegistrationOpen = function () {
  return this.status === "published" && new Date() <= this.registrationDeadline && !this.isFull()
}

const Event = mongoose.model("Event", eventSchema)

export default Event

