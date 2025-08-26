import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import Moderator from "../models/Moderator.js"

// Configuration Google OAuth pour les modérateurs
passport.use(
  "google-moderator",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth Profile:", profile)

        // Chercher un modérateur existant avec cet email ou Google ID
        const moderator = await Moderator.findOne({
          where: {
            $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
          },
        })

        if (moderator) {
          // Mettre à jour les informations si nécessaire
          if (!moderator.googleId) {
            moderator.googleId = profile.id
          }
          if (!moderator.firstName && profile.name?.givenName) {
            moderator.firstName = profile.name.givenName
          }
          if (!moderator.lastName && profile.name?.familyName) {
            moderator.lastName = profile.name.familyName
          }
          if (!moderator.profileImage && profile.photos?.[0]?.value) {
            moderator.profileImage = profile.photos[0].value
          }

          moderator.lastLogin = new Date()
          await moderator.save()

          console.log("Modérateur existant connecté:", moderator.email)
          return done(null, moderator)
        } else {
          // Vérifier si c'est une invitation en attente
          const pendingInvitation = await Moderator.findOne({
            where: {
              email: profile.emails[0].value,
              invitationToken: { $ne: null },
              invitationExpiresAt: { $gt: new Date() },
            },
          })

          if (pendingInvitation) {
            // Activer le compte du modérateur
            pendingInvitation.googleId = profile.id
            pendingInvitation.firstName = profile.name?.givenName || pendingInvitation.firstName
            pendingInvitation.lastName = profile.name?.familyName || pendingInvitation.lastName
            pendingInvitation.profileImage = profile.photos?.[0]?.value || pendingInvitation.profileImage
            pendingInvitation.activatedAt = new Date()
            pendingInvitation.lastLogin = new Date()
            pendingInvitation.invitationToken = null
            pendingInvitation.invitationExpiresAt = null
            pendingInvitation.isActive = true

            await pendingInvitation.save()

            console.log("Modérateur activé via invitation:", pendingInvitation.email)
            return done(null, pendingInvitation)
          } else {
            // Pas d'invitation trouvée
            console.log("Aucune invitation trouvée pour:", profile.emails[0].value)
            return done(null, false, { message: "Aucune invitation trouvée pour cet email" })
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'authentification Google:", error)
        return done(error, null)
      }
    },
  ),
)

// Sérialisation pour les sessions
passport.serializeUser((user, done) => {
  if (user.constructor.name === "Moderator") {
    done(null, { type: "moderator", id: user.id })
  } else {
    done(null, { type: "user", id: user.id })
  }
})

passport.deserializeUser(async (obj, done) => {
  try {
    if (obj.type === "moderator") {
      const moderator = await Moderator.findByPk(obj.id)
      done(null, moderator)
    } else {
      // Pour les utilisateurs normaux si nécessaire
      done(null, null)
    }
  } catch (error) {
    done(error, null)
  }
})

export default passport
