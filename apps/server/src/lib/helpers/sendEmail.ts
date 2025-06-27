import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  secure: true,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.RESEND_API_KEY,
  },
})

transporter
  .verify()
  .then(() => console.log("✅ SMTP verified"))
  .catch((err) => console.error("❌ SMTP error:", err))

export async function sendEmail(opts: {
  to: string
  subject: string
  text?: string
  html?: string
}) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_TO,
    subject: opts.subject,
    html: opts.html,
  })

  console.log("Message sent: %s", info.messageId)
}
