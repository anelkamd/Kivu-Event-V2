import { sequelize } from "../config/database.js"
import User from "./User.js"
import Event from "./Event.js"
import Venue from "./Venue.js"
import Speaker from "./Speaker.js"
import Participant from "./Participant.js"
import Agenda from "./agenda.model.js" 
import Payment from "./payment.model.js" 

// Définition des associations entre les modèles
// Assurez-vous que tous les modèles sont correctement initialisés avant de définir les associations

// 1. User - Event (Organisateur)
User.hasMany(Event, { foreignKey: "organizer_id", as: "organizedEvents" })
Event.belongsTo(User, {
  foreignKey: "organizer_id",
  as: "organizer",
  onDelete: "NO ACTION", // Pas SET NULL car organizer_id est NOT NULL
})

// 2. Venue - Event
Venue.hasMany(Event, { foreignKey: "venue_id", as: "eventsInVenue" })
Event.belongsTo(Venue, {
  foreignKey: "venue_id",
  as: "venue",
  onDelete: "SET NULL", // venue_id nullable
})

// 3. Event - Speaker (Many-to-Many)
Event.belongsToMany(Speaker, {
  through: "event_speakers",
  foreignKey: "event_id",
  otherKey: "speaker_id",
  as: "speakers",
})
Speaker.belongsToMany(Event, {
  through: "event_speakers",
  foreignKey: "speaker_id",
  otherKey: "event_id",
  as: "events",
})

// 4. User - Participant
User.hasMany(Participant, { foreignKey: "user_id", as: "participations" })
Participant.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
  onDelete: "SET NULL", // user_id nullable
})

// 5. Participant - Event
Event.hasMany(Participant, { foreignKey: "event_id", as: "participants" })
Participant.belongsTo(Event, {
  foreignKey: "event_id",
  as: "event",
  onDelete: "NO ACTION", // au lieu de SET NULL
})

// 6. Event - Agenda
Event.hasMany(Agenda, { foreignKey: "event_id", as: "agendaItems" })
Agenda.belongsTo(Event, {
  foreignKey: "event_id",
  as: "event",
  onDelete: "NO ACTION",
})

// 7. Speaker - Agenda
Speaker.hasMany(Agenda, { foreignKey: "speaker_id", as: "agendaSessions" })
Agenda.belongsTo(Speaker, {
  foreignKey: "speaker_id",
  as: "speaker",
  onDelete: "SET NULL", // speaker_id nullable
})

// 8. User - Payment
User.hasMany(Payment, { foreignKey: "user_id", as: "payments" })
Payment.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
  onDelete: "NO ACTION", // user_id NOT NULL
})

// 9. Event - Payment
Event.hasMany(Payment, { foreignKey: "event_id", as: "eventPayments" })
Payment.belongsTo(Event, {
  foreignKey: "event_id",
  as: "event",
  onDelete: "NO ACTION", // event_id NOT NULL
})

export { sequelize, User, Event, Venue, Speaker, Participant, Agenda, Payment }
