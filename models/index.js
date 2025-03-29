// Importation des modèles
import User from "./user.js"
import Event from "./event.js"
import Venue from "./venue.js"
import Speaker from "./speaker.model.js"
import Participant from "./participant.model.js"
import Agenda from "./agenda.model.js"
import Payment from "./payment.model.js"

// Définition des associations entre les modèles
// Assurez-vous que tous les modèles sont correctement initialisés avant de définir les associations
User.hasMany(Event, { foreignKey: "organizer_id", as: "organizedEvents" })
Event.belongsTo(User, { foreignKey: "organizer_id", as: "organizer" })

Venue.hasMany(Event, { foreignKey: "venue_id" })
Event.belongsTo(Venue, { foreignKey: "venue_id" })

Event.belongsToMany(Speaker, { through: "event_speakers", foreignKey: "event_id" })
Speaker.belongsToMany(Event, { through: "event_speakers", foreignKey: "speaker_id" })

User.hasMany(Participant, { foreignKey: "user_id" })
Participant.belongsTo(User, { foreignKey: "user_id" })

Event.hasMany(Participant, { foreignKey: "event_id" })
Participant.belongsTo(Event, { foreignKey: "event_id" })

Event.hasMany(Agenda, { foreignKey: "event_id" })
Agenda.belongsTo(Event, { foreignKey: "event_id" })

Speaker.hasMany(Agenda, { foreignKey: "speaker_id" })
Agenda.belongsTo(Speaker, { foreignKey: "speaker_id" })

User.hasMany(Payment, { foreignKey: "user_id" })
Payment.belongsTo(User, { foreignKey: "user_id" })

Event.hasMany(Payment, { foreignKey: "event_id" })
Payment.belongsTo(Event, { foreignKey: "event_id" })

// Exportation des modèles
export { User, Event, Venue, Speaker, Participant, Agenda, Payment }

