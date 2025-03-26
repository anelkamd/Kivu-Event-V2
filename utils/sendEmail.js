import nodemailer from "nodemailer"

export const sendEmail = async (options) => {
  // Créer un transporteur
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  // Définir les options de l'email
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  }

  // Envoyer l'email
  await transporter.sendMail(mailOptions)
}

