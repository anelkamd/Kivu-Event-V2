const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { pool } = require("../config/database")
const auth = require("../middleware/auth")

const router = express.Router()

// Route d'inscription
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, company, jobTitle } = req.body

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Tous les champs obligatoires doivent être remplis",
      })
    }

    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Un utilisateur avec cet email existe déjà",
      })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const [result] = await pool.execute(
      `INSERT INTO users (first_name, last_name, email, password, phone, company, job_title, role, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'user', NOW(), NOW())`,
      [firstName, lastName, email, hashedPassword, phone || null, company || null, jobTitle || null],
    )

    // Générer le token JWT
    const token = jwt.sign({ userId: result.insertId, email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    // Récupérer les données utilisateur
    const [userData] = await pool.execute(
      "SELECT id, first_name as firstName, last_name as lastName, email, phone, company, job_title as jobTitle, role FROM users WHERE id = ?",
      [result.insertId],
    )

    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      token,
      data: userData[0],
    })
  } catch (error) {
    console.error("Erreur inscription:", error)
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'inscription",
    })
  }
})

// Route de connexion
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email et mot de passe requis",
      })
    }

    // Trouver l'utilisateur
    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Email ou mot de passe incorrect",
      })
    }

    const user = users[0]

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Email ou mot de passe incorrect",
      })
    }

    // Générer le token JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    // Retourner les données utilisateur (sans le mot de passe)
    const userData = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      company: user.company,
      jobTitle: user.job_title,
      role: user.role,
    }

    res.json({
      success: true,
      message: "Connexion réussie",
      token,
      data: userData,
    })
  } catch (error) {
    console.error("Erreur connexion:", error)
    res.status(500).json({
      success: false,
      error: "Erreur lors de la connexion",
    })
  }
})

// Route pour récupérer le profil utilisateur avec ses événements
router.get("/profile", auth, async (req, res) => {
  try {
    const userId = req.user.userId

    // Récupérer les informations utilisateur
    const [userRows] = await pool.execute(
      `SELECT 
        id, first_name as firstName, last_name as lastName, email, phone, 
        company, job_title as jobTitle, profile_image as profileImage,
        role, created_at as createdAt, updated_at as updatedAt
       FROM users 
       WHERE id = ?`,
      [userId],
    )

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      })
    }

    const userData = userRows[0]

    // Récupérer les événements créés par l'utilisateur avec le nombre de participants
    const [eventRows] = await pool.execute(
      `SELECT 
        e.id, e.title, e.description, e.type, 
        e.start_date as startDate, e.end_date as endDate,
        e.capacity, e.registration_deadline as registrationDeadline,
        e.status, e.image, e.price, e.tags,
        e.created_at as createdAt, e.updated_at as updatedAt,
        v.name as venueName, v.address as venueAddress, v.city as venueCity,
        COUNT(p.id) as participantCount
       FROM events e
       LEFT JOIN venues v ON e.venue_id = v.id
       LEFT JOIN participants p ON e.id = p.event_id AND p.status IN ('registered', 'attended')
       WHERE e.organizer_id = ?
       GROUP BY e.id
       ORDER BY e.created_at DESC`,
      [userId],
    )

    // Calculer les statistiques
    const totalEvents = eventRows.length
    const publishedEvents = eventRows.filter((e) => e.status === "published").length
    const draftEvents = eventRows.filter((e) => e.status === "draft").length
    const completedEvents = eventRows.filter((e) => e.status === "completed").length

    // Formater les événements
    const formattedEvents = eventRows.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      capacity: event.capacity,
      registrationDeadline: event.registrationDeadline,
      status: event.status,
      image: event.image,
      price: event.price || 0,
      tags: event.tags,
      participantCount: Number.parseInt(event.participantCount) || 0,
      venue: event.venueName
        ? {
            name: event.venueName,
            address: event.venueAddress,
            city: event.venueCity,
          }
        : null,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }))

    res.json({
      success: true,
      data: {
        user: {
          ...userData,
          totalEvents,
          publishedEvents,
          draftEvents,
          completedEvents,
        },
        events: formattedEvents,
      },
    })
  } catch (error) {
    console.error("Erreur récupération profil:", error)
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération du profil",
    })
  }
})

// Route pour mettre à jour le profil utilisateur
router.put("/profile", auth, async (req, res) => {
  try {
    const userId = req.user.userId
    const { firstName, lastName, email, phone, company, jobTitle } = req.body

    // Validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: "Les champs prénom, nom et email sont obligatoires",
      })
    }

    // Vérifier si l'email n'est pas déjà utilisé par un autre utilisateur
    const [existingUsers] = await pool.execute("SELECT id FROM users WHERE email = ? AND id != ?", [email, userId])

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Cet email est déjà utilisé",
      })
    }

    // Mettre à jour l'utilisateur
    await pool.execute(
      `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, phone = ?, 
           company = ?, job_title = ?, updated_at = NOW()
       WHERE id = ?`,
      [firstName, lastName, email, phone || null, company || null, jobTitle || null, userId],
    )

    // Récupérer les données mises à jour
    const [updatedUser] = await pool.execute(
      `SELECT 
        id, first_name as firstName, last_name as lastName, email, phone, 
        company, job_title as jobTitle, profile_image as profileImage,
        role, created_at as createdAt, updated_at as updatedAt
       FROM users 
       WHERE id = ?`,
      [userId],
    )

    res.json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: updatedUser[0],
    })
  } catch (error) {
    console.error("Erreur mise à jour profil:", error)
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour du profil",
    })
  }
})

// Route pour vérifier l'authentification
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.userId

    const [users] = await pool.execute(
      "SELECT id, first_name as firstName, last_name as lastName, email, phone, company, job_title as jobTitle, role FROM users WHERE id = ?",
      [userId],
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      })
    }

    res.json({
      success: true,
      data: users[0],
    })
  } catch (error) {
    console.error("Erreur vérification auth:", error)
    res.status(500).json({
      success: false,
      error: "Erreur lors de la vérification de l'authentification",
    })
  }
})

module.exports = router
