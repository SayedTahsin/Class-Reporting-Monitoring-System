import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  secure: true,
  port: 465,
  auth: {
    user: "resend",
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
    from: "onboarding@resend.dev",
    to: "delivered@resend.dev",
    subject: opts.subject,
    html: opts.html,
  })

  console.log("Message sent: %s", info.messageId)
}
