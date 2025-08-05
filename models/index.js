// Importation des modèles
import { sequelize } from "../config/database.js" // Importez sequelize ici
import User from "./User.js"
import Event from "./Event.js"
import Venue from "./Venue.js"
import Speaker from "./Speaker.js"
import Participant from "./Participant.js" // Assurez-vous que le nom du fichier est correct
import Agenda from "./agenda.model.js" // Assurez-vous que le nom du fichier est correct
import Payment from "./payment.model.js" // Assurez-vous que le nom du fichier est correct

// Définition des associations entre les modèles
// Assurez-vous que tous les modèles sont correctement initialisés avant de définir les associations

// User - Event (Organisateur)
User.hasMany(Event, { foreignKey: "organizer_id", as: "organizedEvents" })
Event.belongsTo(User, { foreignKey: "organizer_id", as: "organizer" })

// Venue - Event
Venue.hasMany(Event, { foreignKey: "venue_id", as: "eventsInVenue" }) // Ajout d'un alias unique
Event.belongsTo(Venue, { foreignKey: "venue_id", as: "venue" }) // Ajout d'un alias unique

// Event - Speaker (Many-to-Many)
Event.belongsToMany(Speaker, {
  through: "event_speakers",
  foreignKey: "event_id",
  otherKey: "speaker_id",
  as: "speakers", // Ajout d'un alias
})
Speaker.belongsToMany(Event, {
  through: "event_speakers",
  foreignKey: "speaker_id",
  otherKey: "event_id",
  as: "events", // Ajout d'un alias
})

// User - Participant
User.hasMany(Participant, { foreignKey: "user_id", as: "participations" }) // Ajout d'un alias
Participant.belongsTo(User, { foreignKey: "user_id", as: "user" }) // Ajout d'un alias

// Event - Participant
Event.hasMany(Participant, { foreignKey: "event_id", as: "participants" }) // Ajout d'un alias
Participant.belongsTo(Event, { foreignKey: "event_id", as: "event" }) // Ajout d'un alias

// Event - Agenda
Event.hasMany(Agenda, { foreignKey: "event_id", as: "agendaItems" }) // Ajout d'un alias
Agenda.belongsTo(Event, { foreignKey: "event_id", as: "event" }) // Ajout d'un alias

// Speaker - Agenda
Speaker.hasMany(Agenda, { foreignKey: "speaker_id", as: "agendaSessions" }) // Ajout d'un alias
Agenda.belongsTo(Speaker, { foreignKey: "speaker_id", as: "speaker" }) // Ajout d'un alias

// User - Payment
User.hasMany(Payment, { foreignKey: "user_id", as: "payments" }) // Ajout d'un alias
Payment.belongsTo(User, { foreignKey: "user_id", as: "user" }) // Ajout d'un alias

// Event - Payment
Event.hasMany(Payment, { foreignKey: "event_id", as: "eventPayments" }) // Ajout d'un alias
Payment.belongsTo(Event, { foreignKey: "event_id", as: "event" }) // Ajout d'un alias

// Exportation des modèles et de la connexion Sequelize
export { sequelize, User, Event, Venue, Speaker, Participant, Agenda, Payment }
