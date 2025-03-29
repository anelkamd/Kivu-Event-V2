import jwt from "jsonwebtoken"

// Fonction pour générer un token JWT
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    })
}

// On exporte également par défaut pour maintenir la compatibilité
export default generateToken

