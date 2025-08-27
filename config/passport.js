import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { sequelize } from "../config/database.js"
import { QueryTypes } from "sequelize"

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const users = await sequelize.query(
      "SELECT * FROM users WHERE id = ?",
      {
        replacements: [id],
        type: QueryTypes.SELECT,
      }
    )

    if (users.length === 0) {
      return done(new Error("User not found"))
    }
    done(null, users[0])
  } catch (error) {
    done(error)
  }
})

// Google OAuth strategy
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
        // Vérifie si modérateur existe déjà
        const users = await sequelize.query(
          "SELECT * FROM moderators WHERE email = ?",
          {
            replacements: [profile.emails[0].value],
            type: QueryTypes.SELECT,
          }
        )

        if (users.length > 0) {
          return done(null, users[0])
        }

        // Sinon créer le modérateur
        await sequelize.query(
          `INSERT INTO moderators (
            id, first_name, last_name, email, google_id, profile_image, is_active
          ) VALUES (UUID(), ?, ?, ?, ?, ?, true)`,
          {
            replacements: [
              profile.name.givenName,
              profile.name.familyName,
              profile.emails[0].value,
              profile.id,
              profile.photos[0]?.value || null,
            ],
            type: QueryTypes.INSERT,
          }
        )

        const [newUser] = await sequelize.query(
          "SELECT * FROM moderators WHERE email = ?",
          {
            replacements: [profile.emails[0].value],
            type: QueryTypes.SELECT,
          }
        )

        return done(null, newUser)
      } catch (error) {
        return done(error)
      }
    }
  )
)

export default passport
