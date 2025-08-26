import Moderator from "../models/Moderator.js"
import EventModerator from "../models/EventModerator.js"
import Event from "../models/Event.js"
import emailService from "./emailService.js"
import { v4 as uuidv4 } from "uuid"
import { Op } from "sequelize"

class ModeratorService {
  // Inviter un modérateur
  async inviteModerator(organizerId, eventId, moderatorData) {
    try {
      const { email, role = "moderateur", permissions, message } = moderatorData

      // Vérifier que l'événement existe et appartient à l'organisateur
      const event = await Event.findOne({
        where: { id: eventId, organizerId },
      })

      if (!event) {
        throw new Error("Événement non trouvé ou vous n'êtes pas autorisé")
      }

      // Vérifier si le modérateur existe déjà
      let moderator = await Moderator.findOne({ where: { email } })

      if (moderator) {
        // Vérifier s'il n'est pas déjà assigné à cet événement
        const existingAssignment = await EventModerator.findOne({
          where: { eventId, moderatorId: moderator.id },
        })

        if (existingAssignment) {
          throw new Error("Ce modérateur est déjà assigné à cet événement")
        }
      } else {
        // Créer un nouveau modérateur avec invitation
        const invitationToken = uuidv4()
        const invitationExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours

        moderator = await Moderator.create({
          email,
          invitationToken,
          invitationExpiresAt,
          invitedBy: organizerId,
          invitedAt: new Date(),
          isActive: false,
        })
      }

      // Créer l'assignation événement-modérateur
      const eventModerator = await EventModerator.create({
        eventId,
        moderatorId: moderator.id,
        role,
        permissions: permissions || {
          canValidateTasks: true,
          canAssignTasks: role === "superviseur",
          canManageResources: role === "superviseur",
          canViewReports: true,
          canModerateComments: true,
        },
        assignedBy: organizerId,
      })

      // Envoyer l'email d'invitation
      await this.sendInvitationEmail(moderator, event, message)

      return {
        moderator,
        eventModerator,
        invitationSent: true,
      }
    } catch (error) {
      console.error("Erreur lors de l'invitation du modérateur:", error)
      throw error
    }
  }

  // Envoyer l'email d'invitation
  async sendInvitationEmail(moderator, event, customMessage = "") {
    const invitationUrl = `${process.env.FRONTEND_URL}/moderator/activate?token=${moderator.invitationToken}&email=${encodeURIComponent(moderator.email)}`

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation Modérateur - Kivu Event</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background-color: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #28a745;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #28a745;
                margin: 0;
                font-size: 28px;
            }
            .event-info {
                background-color: #e8f5e8;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .cta-button {
                display: inline-block;
                background-color: #28a745;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Invitation Modérateur</h1>
                <p>Vous êtes invité(e) à modérer un événement</p>
            </div>

            <p>Bonjour,</p>
            
            <p>Vous avez été invité(e) à devenir modérateur pour l'événement suivant sur <strong>Kivu Event</strong> :</p>
            
            <div class="event-info">
                <h3>📅 ${event.title}</h3>
                <p><strong>Description :</strong> ${event.description}</p>
                <p><strong>Date :</strong> ${new Date(event.startDate).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</p>
                ${event.venue ? `<p><strong>Lieu :</strong> ${event.venue.name}</p>` : ""}
            </div>

            ${customMessage ? `<div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;"><h4>Message de l'organisateur :</h4><p>${customMessage}</p></div>` : ""}

            <div style="text-align: center;">
                <h3>🔑 Vos responsabilités en tant que modérateur :</h3>
                <ul style="text-align: left; display: inline-block;">
                    <li>Valider les tâches accomplies</li>
                    <li>Superviser l'avancement du projet</li>
                    <li>Modérer les commentaires et discussions</li>
                    <li>Assurer la qualité des livrables</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <p><strong>Pour accepter cette invitation, connectez-vous avec votre compte Google :</strong></p>
                <a href="${invitationUrl}" class="cta-button">🚀 Accepter l'invitation</a>
            </div>

            <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4>ℹ️ Important :</h4>
                <ul>
                    <li>Cette invitation expire dans 7 jours</li>
                    <li>Vous devez vous connecter avec Google pour accéder à la plateforme</li>
                    <li>Votre email doit correspondre à celui de cette invitation</li>
                </ul>
            </div>

            <div class="footer">
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                <p><strong>Kivu Event</strong> - Plateforme de gestion d'événements</p>
            </div>
        </div>
    </body>
    </html>
    `

    try {
      const result = await emailService.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: moderator.email,
        subject: `🎯 Invitation Modérateur - ${event.title}`,
        html: htmlContent,
      })

      console.log("✅ Email d'invitation modérateur envoyé:", result.messageId)
      return result
    } catch (error) {
      console.error("❌ Erreur envoi email d'invitation modérateur:", error)
      throw error
    }
  }

  // Activer un modérateur via token
  async activateModerator(token, email) {
    try {
      const moderator = await Moderator.findOne({
        where: {
          email,
          invitationToken: token,
          invitationExpiresAt: { [Op.gt]: new Date() },
        },
      })

      if (!moderator) {
        throw new Error("Token d'invitation invalide ou expiré")
      }

      // Le modérateur sera activé lors de la connexion Google
      return moderator
    } catch (error) {
      console.error("Erreur lors de l'activation du modérateur:", error)
      throw error
    }
  }

  // Obtenir les modérateurs d'un événement
  async getEventModerators(eventId) {
    try {
      const moderators = await EventModerator.findAll({
        where: { eventId, isActive: true },
        include: [
          {
            model: Moderator,
            as: "moderator",
            attributes: ["id", "email", "firstName", "lastName", "profileImage", "specialization", "isActive"],
          },
        ],
      })

      return moderators
    } catch (error) {
      console.error("Erreur lors de la récupération des modérateurs:", error)
      throw error
    }
  }

  // Révoquer un modérateur
  async revokeModerator(organizerId, eventId, moderatorId) {
    try {
      // Vérifier que l'événement appartient à l'organisateur
      const event = await Event.findOne({
        where: { id: eventId, organizerId },
      })

      if (!event) {
        throw new Error("Événement non trouvé ou vous n'êtes pas autorisé")
      }

      const eventModerator = await EventModerator.findOne({
        where: { eventId, moderatorId },
      })

      if (!eventModerator) {
        throw new Error("Assignation de modérateur non trouvée")
      }

      eventModerator.isActive = false
      await eventModerator.save()

      return { success: true, message: "Modérateur révoqué avec succès" }
    } catch (error) {
      console.error("Erreur lors de la révocation du modérateur:", error)
      throw error
    }
  }
}

export default new ModeratorService()
