import User from "./User.js"
import Event from "./Event.js"
import Venue from "./Venue.js"
import Speaker from "./Speaker.js"
import Participant from "./Participant.js"
import Agenda from "./Agenda.js"

// Associations User - Event (Organisateur)
User.hasMany(Event, { as: "organizedEvents", foreignKey: "organizerId" })
Event.belongsTo(User, { as: "organizer", foreignKey: "organizerId" })

// Associations Event - Venue
Venue.hasMany(Event, { foreignKey: "venueId" })
Event.belongsTo(Venue, { foreignKey: "venueId" })

// Associations Event - Speaker (via table de jonction)
Event.belongsToMany(Speaker, { through: "event_speakers", timestamps: true })
Speaker.belongsToMany(Event, { through: "event_speakers", timestamps: true })

// Associations User - Event (via Participant)
User.belongsToMany(Event, {
  through: Participant,
  foreignKey: "userId",
  otherKey: "eventId",
})
Event.belongsToMany(User, {
  through: Participant,
  foreignKey: "eventId",
  otherKey: "userId",
})

// Associations Event - Agenda
Event.hasMany(Agenda, { foreignKey: "eventId" })
Agenda.belongsTo(Event, { foreignKey: "eventId" })

// Associations Speaker - Agenda
Speaker.hasMany(Agenda, { foreignKey: "speakerId" })
Agenda.belongsTo(Speaker, { foreignKey: "speakerId" })

export { User, Event, Venue, Speaker, Participant, Agenda }

