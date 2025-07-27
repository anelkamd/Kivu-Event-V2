import express from "express"
import { body, validationResult } from "express-validator"
import nodemailer from "nodemailer"
import colors from "colors"

const router = express.Router()

// Simple rate limiting en mémoire (pour éviter la dépendance express-rate-limit)
const requestCounts = new Map()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 5

const simpleRateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress
  const now = Date.now()

  // Nettoyer les anciennes entrées
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.firstRequest > RATE_LIMIT_WINDOW) {
      requestCounts.delete(ip)
    }
  }

  const clientData = requestCounts.get(clientIP)

  if (!clientData) {
    requestCounts.set(clientIP, { count: 1, firstRequest: now })
    return next()
  }

  if (now - clientData.firstRequest > RATE_LIMIT_WINDOW) {
    requestCounts.set(clientIP, { count: 1, firstRequest: now })
    return next()
  }

  if (clientData.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: "Trop de messages envoyés. Veuillez réessayer dans 15 minutes.",
    })
  }

  clientData.count++
  next()
}

// Configuration du transporteur email (CORRIGÉ: utilise SMTP_PASSWORD au lieu de SMTP_PASS)
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true pour 465, false pour les autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD, // CORRIGÉ: utilise SMTP_PASSWORD
    },
  }

  console.log(colors.blue("📧 Configuration SMTP:"))
  console.log(colors.cyan(`   Host: ${config.host}`))
  console.log(colors.cyan(`   Port: ${config.port}`))
  console.log(colors.cyan(`   User: ${config.auth.user}`))
  console.log(colors.cyan(`   Pass: ${config.auth.pass ? "***configuré***" : "❌ MANQUANT"}`))

  return nodemailer.createTransport(config)
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
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff; 
        }
        .header { 
          background: linear-gradient(135deg, #000000, #333333); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 24px; 
          font-weight: 600; 
        }
        .header p { 
          margin: 10px 0 0 0; 
          opacity: 0.9; 
        }
        .content { 
          padding: 30px 20px; 
        }
        .field { 
          margin-bottom: 20px; 
          border-bottom: 1px solid #f0f0f0; 
          padding-bottom: 15px; 
        }
        .field:last-child { 
          border-bottom: none; 
        }
        .label { 
          font-weight: 600; 
          color: #555; 
          font-size: 14px; 
          text-transform: uppercase; 
          letter-spacing: 0.5px; 
          margin-bottom: 8px; 
        }
        .value { 
          background: #f8f9fa; 
          padding: 15px; 
          border-radius: 8px; 
          border-left: 4px solid #000000; 
          font-size: 16px; 
        }
        .message-value { 
          background: #ffffff; 
          border: 1px solid #e9ecef; 
          padding: 20px; 
          border-radius: 8px; 
          line-height: 1.6; 
        }
        .footer { 
          background: #f8f9fa; 
          text-align: center; 
          padding: 20px; 
          color: #666; 
          font-size: 14px; 
          border-top: 1px solid #e9ecef; 
        }
        .footer strong { 
          color: #000000; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 Nouveau message de contact</h1>
          <p>Kivu Event - Plateforme de gestion d'événements</p>
        </div>
        
        <div class="content">
          <div class="field">
            <div class="label">👤 Nom complet</div>
            <div class="value">${data.name}</div>
          </div>
          
          <div class="field">
            <div class="label">📧 Adresse email</div>
            <div class="value">${data.email}</div>
          </div>
          
          <div class="field">
            <div class="label">📝 Sujet</div>
            <div class="value">${data.subject}</div>
          </div>
          
          <div class="field">
            <div class="label">💬 Message</div>
            <div class="message-value">${data.message.replace(/\n/g, "<br>")}</div>
          </div>
          
          <div class="field">
            <div class="label">🕒 Date de réception</div>
            <div class="value">${new Date().toLocaleString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Action requise :</strong> Répondez directement à <strong>${data.email}</strong> pour contacter l'expéditeur</p>
          <p>Ce message a été envoyé via le formulaire de contact de Kivu Event</p>
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
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #ffffff; 
        }
        .header { 
          background: linear-gradient(135deg, #000000, #333333); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600; 
        }
        .header p { 
          margin: 10px 0 0 0; 
          opacity: 0.9; 
          font-size: 16px; 
        }
        .content { 
          padding: 30px 20px; 
        }
        .greeting { 
          font-size: 18px; 
          margin-bottom: 20px; 
        }
        .highlight { 
          background: linear-gradient(135deg, #f8f9fa, #e9ecef); 
          padding: 20px; 
          border-radius: 12px; 
          margin: 20px 0; 
          border-left: 4px solid #000000; 
        }
        .highlight h3 { 
          margin-top: 0; 
          color: #000000; 
          font-size: 18px; 
        }
        .steps { 
          background: #f0f9ff; 
          padding: 20px; 
          border-radius: 12px; 
          margin: 20px 0; 
        }
        .steps h3 { 
          color: #1e40af; 
          margin-top: 0; 
        }
        .steps ul { 
          margin: 10px 0; 
          padding-left: 20px; 
        }
        .steps li { 
          margin: 8px 0; 
        }
        .button-container { 
          text-align: center; 
          margin: 30px 0; 
        }
        .button { 
          display: inline-block; 
          background: linear-gradient(135deg, #000000, #333333); 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 8px; 
          margin: 10px; 
          font-weight: 600; 
          transition: transform 0.2s; 
        }
        .button:hover { 
          transform: translateY(-2px); 
        }
        .footer { 
          background: #f8f9fa; 
          text-align: center; 
          padding: 30px 20px; 
          color: #666; 
          font-size: 14px; 
          border-top: 1px solid #e9ecef; 
        }
        .footer strong { 
          color: #000000; 
        }
        .contact-info { 
          margin-top: 15px; 
          line-height: 1.4; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Message bien reçu !</h1>
          <p>Merci de nous avoir contactés</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            Bonjour <strong>${data.name}</strong>,
          </div>
          
          <p>Nous avons bien reçu votre message concernant : <strong>"${data.subject}"</strong></p>
          
          <div class="highlight">
            <h3>📝 Récapitulatif de votre message</h3>
            <p><strong>Sujet :</strong> ${data.subject}</p>
            <p><strong>Date d'envoi :</strong> ${new Date().toLocaleString("fr-FR")}</p>
            <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e9ecef;">
              ${data.message.replace(/\n/g, "<br>")}
            </div>
          </div>
          
          <div class="steps">
            <h3>🚀 Que se passe-t-il maintenant ?</h3>
            <ul>
              <li><strong>Examen de votre demande</strong> - Notre équipe analyse votre message</li>
              <li><strong>Réponse sous 24-48h</strong> - Nous vous répondrons à l'adresse : <strong>${data.email}</strong></li>
              <li><strong>Support urgent ?</strong> - Appelez le <strong>+243 123 456 789</strong></li>
            </ul>
          </div>
          
          <p>En attendant notre réponse, n'hésitez pas à explorer nos fonctionnalités ou consulter notre centre d'aide :</p>
          
          <div class="button-container">
            <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/features" class="button">
              🎯 Nos fonctionnalités
            </a>
            <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/help" class="button">
              ❓ Centre d'aide
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Kivu Event</strong> - Plateforme de gestion d'événements d'entreprise</p>
          <div class="contact-info">
            <p>📍 123 Avenue des Événements, Kinshasa, RDC</p>
            <p>📞 +243 123 456 789 | 📧 support@kivu-event.com</p>
          </div>
          <p style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Route POST pour envoyer un message de contact
router.post("/", simpleRateLimit, validateContactForm, async (req, res) => {
  try {
    console.log(colors.blue("📧 Nouveau message de contact reçu"))

    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log(colors.red("❌ Erreurs de validation:"), errors.array())
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array(),
      })
    }

    const { name, email, subject, message } = req.body

    // Vérifier que les variables d'environnement sont configurées
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error(colors.red("❌ Variables d'environnement manquantes:"))
      console.error(colors.red(`   SMTP_USER: ${process.env.SMTP_USER ? "✓" : "❌ MANQUANT"}`))
      console.error(colors.red(`   SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? "✓" : "❌ MANQUANT"}`))

      return res.status(500).json({
        success: false,
        message: "Configuration email incomplète. Contactez l'administrateur.",
      })
    }

    // Créer le transporteur email
    const transporter = createTransporter()

    // Vérifier la configuration email
    try {
      console.log(colors.yellow("🔍 Vérification de la configuration SMTP..."))
      await transporter.verify()
      console.log(colors.green("✓ Configuration email vérifiée avec succès"))
    } catch (error) {
      console.error(colors.red("❌ Erreur de configuration email:"), error.message)
      console.error(colors.red("💡 Vérifiez vos paramètres SMTP dans le fichier .env"))

      return res.status(500).json({
        success: false,
        message: "Service email temporairement indisponible. Vérifiez la configuration SMTP.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }

    // Préparer les données
    const contactData = { name, email, subject, message }

    // Email à l'équipe support
    const supportMailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.SUPPORT_EMAIL || process.env.SMTP_USER, // Utilise SMTP_USER si SUPPORT_EMAIL n'est pas défini
      subject: `[Contact Kivu Event] ${subject}`,
      html: createSupportEmailTemplate(contactData),
      replyTo: email,
    }

    // Email de confirmation à l'utilisateur
    const confirmationMailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "✅ Confirmation de réception - Kivu Event",
      html: createConfirmationEmailTemplate(contactData),
    }

    // Envoyer les emails
    console.log(colors.yellow("📤 Envoi des emails..."))
    console.log(colors.cyan(`   📧 Support: ${supportMailOptions.to}`))
    console.log(colors.cyan(`   📧 Confirmation: ${email}`))

    const [supportResult, confirmationResult] = await Promise.allSettled([
      transporter.sendMail(supportMailOptions),
      transporter.sendMail(confirmationMailOptions),
    ])

    // Vérifier les résultats
    if (supportResult.status === "rejected") {
      console.error(colors.red("❌ Erreur envoi email support:"), supportResult.reason.message)
      return res.status(500).json({
        success: false,
        message: "Erreur lors de l'envoi du message à l'équipe support",
        error: process.env.NODE_ENV === "development" ? supportResult.reason.message : undefined,
      })
    }

    if (confirmationResult.status === "rejected") {
      console.error(colors.yellow("⚠️ Erreur envoi email confirmation:"), confirmationResult.reason.message)
      // On continue même si l'email de confirmation échoue
    }

    // Log pour le monitoring
    console.log(colors.green(`✅ Message de contact traité avec succès:`))
    console.log(colors.cyan(`   👤 De: ${name} (${email})`))
    console.log(colors.cyan(`   📝 Sujet: ${subject}`))
    console.log(colors.cyan(`   🕒 Date: ${new Date().toLocaleString("fr-FR")}`))
    console.log(colors.cyan(`   📧 Support envoyé: ${supportResult.status === "fulfilled" ? "✓" : "❌"}`))
    console.log(colors.cyan(`   📧 Confirmation envoyée: ${confirmationResult.status === "fulfilled" ? "✓" : "❌"}`))

    res.status(200).json({
      success: true,
      message: "Message envoyé avec succès ! Nous vous répondrons sous 24-48h.",
      data: {
        name,
        email,
        subject,
        timestamp: new Date().toISOString(),
        supportSent: supportResult.status === "fulfilled",
        confirmationSent: confirmationResult.status === "fulfilled",
      },
    })
  } catch (error) {
    console.error(colors.red("❌ Erreur lors de l'envoi du message de contact:"), error)
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur. Veuillez réessayer plus tard.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// Route GET pour obtenir les informations de contact publiques
router.get("/info", (req, res) => {
  console.log(colors.blue("📋 Demande d'informations de contact"))

  res.json({
    success: true,
    data: {
      company: {
        name: "Kivu Event",
        description: "Plateforme de gestion d'événements d'entreprise",
        website: process.env.FRONTEND_URL || "http://localhost:3000",
      },
      address: {
        street: "123 Avenue des Événements",
        city: "Kinshasa",
        province: "Kinshasa",
        country: "République Démocratique du Congo",
        postalCode: "BP 1234",
      },
      contact: {
        phone: ["+243 123 456 789", "+243 987 654 321"],
        email: {
          general: "contact@kivu-event.com",
          support: "support@kivu-event.com",
          commercial: "commercial@kivu-event.com",
          legal: "legal@kivu-event.com",
        },
        hours: {
          weekdays: "Lundi - Vendredi : 8h00 - 18h00",
          saturday: "Samedi : 9h00 - 15h00",
          sunday: "Dimanche : Fermé",
          timezone: "GMT+1 (Heure de Kinshasa)",
        },
      },
      socialMedia: {
        facebook: "https://facebook.com/kivuevent",
        twitter: "https://twitter.com/kivuevent",
        linkedin: "https://linkedin.com/company/kivuevent",
        instagram: "https://instagram.com/kivuevent",
      },
      support: {
        responseTime: "24-48 heures",
        languages: ["Français", "Lingala", "Anglais"],
        urgentContact: "+243 123 456 789",
      },
    },
  })
})

// Route GET pour vérifier le statut du service email
router.get("/email-status", async (req, res) => {
  try {
    console.log(colors.blue("🔍 Vérification du statut email..."))

    // Vérifier les variables d'environnement
    const envCheck = {
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
      EMAIL_FROM: !!process.env.EMAIL_FROM,
    }

    console.log(colors.cyan("📋 Variables d'environnement:"))
    Object.entries(envCheck).forEach(([key, value]) => {
      console.log(colors.cyan(`   ${key}: ${value ? "✓" : "❌"}`))
    })

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return res.status(500).json({
        success: false,
        message: "Configuration email incomplète",
        config: envCheck,
      })
    }

    const transporter = createTransporter()
    await transporter.verify()

    console.log(colors.green("✅ Service email opérationnel"))

    res.json({
      success: true,
      message: "Service email opérationnel",
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === "465",
        user: process.env.SMTP_USER,
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        envCheck,
      },
    })
  } catch (error) {
    console.error(colors.red("❌ Service email indisponible:"), error.message)

    res.status(500).json({
      success: false,
      message: "Service email indisponible",
      error: error.message,
      config: {
        host: process.env.SMTP_HOST || "Non configuré",
        port: process.env.SMTP_PORT || "Non configuré",
        user: process.env.SMTP_USER || "Non configuré",
        passwordConfigured: !!process.env.SMTP_PASSWORD,
      },
    })
  }
})

export default router
