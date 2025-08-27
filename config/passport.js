import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { sequelize } from "../config/database.js"
import { QueryTypes } from "sequelize"

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const users = await sequelize.query(
      "SELECT * FROM users WHERE id = ?",
      {
        replacements: [id],
        type: QueryTypes.SELECT,
      }
    )

    if (!users || users.length === 0) {
      return done(new Error("User not found"))
    }

    done(null, users[0])
  } catch (error) {
    done(error)
  }
})

// Google OAuth strategy for moderators
passport.use(
  "google-moderator",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/moderator/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Vérifier si l'utilisateur existe déjà
        const users = await sequelize.query(
          "SELECT * FROM users WHERE email = ? AND role = 'moderator'",
          {
            replacements: [profile.emails[0].value],
            type: QueryTypes.SELECT,
          }
        )

        if (users.length > 0) {
          return done(null, users[0])
        }

        // Sinon, créer un nouveau modérateur
        await sequelize.query(
          `INSERT INTO users (
            id, 
            first_name, 
            last_name, 
            email, 
            password, 
            role, 
            profile_image
          ) VALUES (
            UUID(), 
            ?, 
            ?, 
            ?, 
            '', 
            'moderator',
            ?
          )`,
          {
            replacements: [
              profile.name.givenName,
              profile.name.familyName,
              profile.emails[0].value,
              profile.photos[0]?.value || null,
            ],
          }
        )

        // Récupérer le nouvel utilisateur
        const newUser = await sequelize.query(
          "SELECT * FROM users WHERE email = ?",
          {
            replacements: [profile.emails[0].value],
            type: QueryTypes.SELECT,
          }
        )

        return done(null, newUser[0])
      } catch (error) {
        return done(error)
      }
    }
  )
)

export default passport
