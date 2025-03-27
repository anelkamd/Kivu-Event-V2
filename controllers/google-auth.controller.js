import { User } from "../models/index.js"
import { generateToken } from "../utils/generateToken.js"
import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
)

// @desc    Rediriger vers Google pour l'authentification
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = (req, res) => {
    const authUrl = client.generateAuthUrl({
        access_type: "offline",
        scope: ["profile", "email"],
        prompt: "consent",
    })
    res.redirect(authUrl)
}

// @desc    Callback après authentification Google
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res) => {
    try {
        const { code } = req.query
        const { tokens } = await client.getToken(code)
        client.setCredentials(tokens)

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        })

        const payload = ticket.getPayload()
        const { email, given_name, family_name, picture } = payload

        // Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({ where: { email } })

        if (!user) {
            // Créer un nouvel utilisateur
            user = await User.create({
                firstName: given_name,
                lastName: family_name,
                email,
                password: Math.random().toString(36).slice(-8), // Mot de passe aléatoire
                profileImage: picture,
            })
        }

        // Générer un token JWT
        const token = generateToken(user.id)

        // Rediriger vers le frontend avec le token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`)
    } catch (error) {
        console.error("Google auth error:", error)
        res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`)
    }
}