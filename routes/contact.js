const express = require("express")
const { body, validationResult } = require("express-validator")
const rateLimit = require("express-rate-limit")
const nodemailer = require("nodemailer")
const router = express.Router()

// Rate limiting pour les messages de contact
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 messages par IP toutes les 15 minutes
  message: {
    error: "Trop de messages envoyés. Veuillez réessayer dans 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Configuration du transporteur email
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// Validation des données du formulaire
const validateContactForm = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Le nom doit contenir entre 2 et 100 caractères")
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage("Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets"),

  body("email").isEmail().normalizeEmail().withMessage("Veuillez fournir une adresse email valide"),

  body("subject").trim().isLength({ min: 5, max: 200 }).withMessage("Le sujet doit contenir entre 5 et 200 caractères"),

  body("message")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Le message doit contenir entre 10 et 2000 caractères"),
]

// Template HTML pour l'email à l'équipe support
const createSupportEmailTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouveau message de contact - Kivu Event</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { background: white; padding: 10px; border-radius: 5px; margin-top: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nouveau message de contact</h1>
          <p>Kivu Event - Plateforme de gestion d'événements</p>
        </div>
        
        <div class="content">
          <div class="field">
            <div class="label">Nom complet :</div>
            <div class="value">${data.name}</div>
          </div>
          
          <div class="field">
            <div class="label">Email :</div>
            <div class="value">${data.email}</div>
          </div>
          
          <div class="field">
            <div class="label">Sujet :</div>
            <div class="value">${data.subject}</div>
          </div>
          
          <div class="field">
            <div class="label">Message :</div>
            <div class="value">${data.message.replace(/\n/g, "<br>")}</div>
          </div>
          
          <div class="field">
            <div class="label">Date de réception :</div>
            <div class="value">${new Date().toLocaleString("fr-FR")}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Ce message a été envoyé via le formulaire de contact de Kivu Event</p>
          <p>Répondez directement à ${data.email} pour contacter l'expéditeur</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template HTML pour l'email de confirmation à l'utilisateur
const createConfirmationEmailTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmation de réception - Kivu Event</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .highlight { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Message bien reçu !</h1>
          <p>Merci de nous avoir contactés</p>
        </div>
        
        <div class="content">
          <p>Bonjour <strong>${data.name}</strong>,</p>
          
          <p>Nous avons bien reçu votre message concernant : <strong>"${data.subject}"</strong></p>
          
          <div class="highlight">
            <h3>Votre message :</h3>
            <p>${data.message.replace(/\n/g, "<br>")}</p>
          </div>
          
          <p>Notre équipe support vous répondra dans les <strong>24 heures</strong> qui suivent à l'adresse email : <strong>${data.email}</strong></p>
          
          <p>En attendant, n'hésitez pas à consulter notre centre d'aide ou à explorer nos fonctionnalités :</p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/help" class="button">Centre d'aide</a>
            <a href="${process.env.FRONTEND_URL}/features" class="button">Nos fonctionnalités</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Kivu Event</strong> - Plateforme de gestion d'événements</p>
          <p>123 Avenue des Événements, Kinshasa, RDC</p>
          <p>Téléphone: +243 123 456 789 | Email: support@kivu-event.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Route POST pour envoyer un message de contact
router.post("/", contactLimiter, validateContactForm, async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array(),
      })
    }

    const { name, email, subject, message } = req.body

    // Créer le transporteur email
    const transporter = createTransporter()

    // Vérifier la configuration email
    try {
      await transporter.verify()
    } catch (error) {
      console.error("Erreur de configuration email:", error)
      return res.status(500).json({
        success: false,
        message: "Erreur de configuration du service email",
      })
    }

    // Préparer les données
    const contactData = { name, email, subject, message }

    // Email à l'équipe support
    const supportMailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SUPPORT_EMAIL || "support@kivu-event.com",
      subject: `[Contact Kivu Event] ${subject}`,
      html: createSupportEmailTemplate(contactData),
      replyTo: email,
    }

    // Email de confirmation à l'utilisateur
    const confirmationMailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Confirmation de réception - Kivu Event",
      html: createConfirmationEmailTemplate(contactData),
    }

    // Envoyer les emails
    const [supportResult, confirmationResult] = await Promise.allSettled([
      transporter.sendMail(supportMailOptions),
      transporter.sendMail(confirmationMailOptions),
    ])

    // Vérifier les résultats
    if (supportResult.status === "rejected") {
      console.error("Erreur envoi email support:", supportResult.reason)
      return res.status(500).json({
        success: false,
        message: "Erreur lors de l'envoi du message à l'équipe support",
      })
    }

    if (confirmationResult.status === "rejected") {
      console.error("Erreur envoi email confirmation:", confirmationResult.reason)
      // On continue même si l'email de confirmation échoue
    }

    // Log pour le monitoring
    console.log(`Message de contact reçu de ${name} (${email}) - Sujet: ${subject}`)

    res.status(200).json({
      success: true,
      message: "Message envoyé avec succès. Nous vous répondrons sous 24h.",
      data: {
        name,
        email,
        subject,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Erreur lors de l'envoi du message de contact:", error)
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    })
  }
})

// Route GET pour obtenir les informations de contact publiques
router.get("/info", (req, res) => {
  res.json({
    success: true,
    data: {
      address: {
        street: "123 Avenue des Événements",
        city: "Goma",
        country: "République Démocratique du Congo",
        postalCode: "BP 1234",
      },
      phone: ["+243 123 456 789", "+243 987 654 321"],
      email: ["contact@kivu-event.com", "support@kivu-event.com"],
      hours: {
        weekdays: "8h00 - 18h00",
        saturday: "9h00 - 15h00",
        sunday: "Fermé",
      },
      socialMedia: {
        facebook: "https://facebook.com/kivuevent",
        twitter: "https://twitter.com/kivuevent",
        linkedin: "https://linkedin.com/company/kivuevent",
      },
    },
  })
})

module.exports = router
