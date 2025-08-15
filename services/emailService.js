import nodemailer from "nodemailer"
import QRCode from "qrcode"

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD, // Changé de SMTP_PASS à SMTP_PASSWORD
      },
    })
  }

  async generateQRCode(data) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(data), {
        errorCorrectionLevel: "M",
        type: "image/png",
        quality: 0.92,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        width: 256,
      })
      return qrCodeDataURL
    } catch (error) {
      console.error("❌ Erreur génération QR code:", error)
      throw error
    }
  }

  async sendConfirmationEmail(participant, event) {
    try {
      console.log("📧 Envoi email de confirmation à:", participant.email)

      // Données pour le QR code
      const qrData = {
        participantId: participant.id,
        eventId: event.id,
        eventTitle: event.title,
        participantName: `${participant.firstName} ${participant.lastName}`,
        participantEmail: participant.email,
        registrationDate: participant.registrationDate,
        eventDate: event.startDate,
        venue: event.venue?.name || "Lieu à définir",
        checkInCode: `${participant.id}-${event.id}`,
      }

      // Générer le QR code
      const qrCodeDataURL = await this.generateQRCode(qrData)

      // Formatage des dates
      const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      }

      // Template HTML pour l'email
      const emailHTML = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmation d'inscription - ${event.title}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: white;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
              border-radius: 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .header p {
              margin: 10px 0 0 0;
              font-size: 16px;
              opacity: 0.9;
            }
            .content { 
              padding: 40px 30px; 
            }
            .event-details { 
              background: #f8f9ff; 
              padding: 25px; 
              border-radius: 12px; 
              margin: 25px 0; 
              border-left: 4px solid #667eea; 
            }
            .event-details h3 {
              margin: 0 0 15px 0;
              color: #333;
              font-size: 20px;
            }
            .qr-section { 
              text-align: center; 
              background: white; 
              padding: 30px; 
              border-radius: 12px; 
              margin: 25px 0; 
              border: 2px solid #e1e5e9;
            }
            .qr-code { 
              max-width: 200px; 
              height: auto; 
              border: 2px solid #ddd; 
              border-radius: 12px; 
              margin: 15px 0;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding: 25px; 
              color: #666; 
              font-size: 14px; 
              background-color: #f8f9fa;
              border-top: 1px solid #e9ecef;
            }
            .button { 
              display: inline-block; 
              background: #667eea; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 10px 0; 
              font-weight: 500;
            }
            .info-row { 
              margin: 12px 0; 
              display: flex;
              align-items: flex-start;
            }
            .info-label { 
              font-weight: 600; 
              color: #555; 
              min-width: 120px;
              margin-right: 10px;
            }
            .info-value {
              color: #333;
            }
            .highlight-box {
              background: #e8f4fd;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #2196F3;
            }
            .highlight-box h4 {
              margin: 0 0 10px 0;
              color: #1976D2;
            }
            .highlight-box ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .highlight-box li {
              margin: 5px 0;
            }
            .success-badge {
              background: #4CAF50;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 500;
              display: inline-block;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Inscription confirmée !</h1>
              <p>Bienvenue à l'événement</p>
              <div class="success-badge">✓ Inscription validée</div>
            </div>
            
            <div class="content">
              <h2>Bonjour ${participant.firstName} ${participant.lastName},</h2>
              
              <p>Nous avons le plaisir de confirmer votre inscription à l'événement suivant :</p>
              
              <div class="event-details">
                <h3>📅 ${event.title}</h3>
                <div class="info-row">
                  <span class="info-label">🗓️ Date :</span>
                  <span class="info-value">${formatDate(event.startDate)}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📍 Lieu :</span>
                  <span class="info-value">${event.venue?.name || "Lieu à définir"}</span>
                </div>
                ${
                  event.venue?.address
                    ? `<div class="info-row"><span class="info-label">📍 Adresse :</span><span class="info-value">${event.venue.address}</span></div>`
                    : ""
                }
                <div class="info-row">
                  <span class="info-label">💰 Prix :</span>
                  <span class="info-value">${event.price > 0 ? `${event.price} €` : "Gratuit"}</span>
                </div>
                ${
                  participant.company
                    ? `<div class="info-row"><span class="info-label">🏢 Entreprise :</span><span class="info-value">${participant.company}</span></div>`
                    : ""
                }
                ${
                  participant.jobTitle
                    ? `<div class="info-row"><span class="info-label">💼 Poste :</span><span class="info-value">${participant.jobTitle}</span></div>`
                    : ""
                }
              </div>
              
              <div class="qr-section">
                <h3>🎫 Votre QR Code d'accès</h3>
                <p>Présentez ce QR code le jour de l'événement pour un check-in rapide :</p>
                <img src="${qrCodeDataURL}" alt="QR Code d'accès" class="qr-code" />
                <p><strong>Code de référence :</strong> ${qrData.checkInCode}</p>
                <p><small>⚠️ Gardez ce QR code précieusement, il vous sera demandé à l'entrée.</small></p>
              </div>
              
              <div class="highlight-box">
                <h4>📋 Informations importantes :</h4>
                <ul>
                  <li><strong>Arrivée :</strong> Présentez-vous 15 minutes avant le début de l'événement</li>
                  <li><strong>Check-in :</strong> Montrez votre QR code à l'accueil pour un accès rapide</li>
                  <li><strong>Contact :</strong> En cas de problème, contactez l'organisateur</li>
                  ${
                    participant.dietaryRestrictions
                      ? `<li><strong>Restrictions alimentaires :</strong> ${participant.dietaryRestrictions}</li>`
                      : ""
                  }
                  ${
                    participant.specialRequirements
                      ? `<li><strong>Besoins spéciaux :</strong> ${participant.specialRequirements}</li>`
                      : ""
                  }
                </ul>
              </div>
              
              <p style="text-align: center; margin: 30px 0;">
                <strong>Nous avons hâte de vous voir à l'événement ! 🚀</strong>
              </p>
              
              <div class="footer">
                <p><strong>Kivu Events</strong> - Plateforme de gestion d'événements</p>
                <p>Cet email a été envoyé automatiquement suite à votre inscription.</p>
                <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #888;">
                  Email envoyé le ${formatDate(new Date())} | 
                  ID Participant: ${participant.id}
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      // Envoyer l'email
      const mailOptions = {
        from: process.env.EMAIL_FROM || `"Kivu Events" <${process.env.SMTP_USER}>`, // Utilise EMAIL_FROM
        to: participant.email,
        subject: `✅ Confirmation d'inscription - ${event.title}`,
        html: emailHTML,
        attachments: [
          {
            filename: `qr-code-${participant.id}.png`,
            content: qrCodeDataURL.split(",")[1],
            encoding: "base64",
            cid: "qrcode",
          },
        ],
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log("✅ Email de confirmation envoyé avec succès:", result.messageId)
      return result
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de l'email:", error)
      throw error
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify()
      console.log("✅ Connexion SMTP vérifiée")
      return true
    } catch (error) {
      console.error("❌ Erreur connexion SMTP:", error)
      return false
    }
  }
}

export default new EmailService()
