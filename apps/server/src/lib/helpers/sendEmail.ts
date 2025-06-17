import dotenv from "dotenv"
import nodemailer from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"
dotenv.config()

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing env var: ${name}`)
  return val
}

const smtpOptions: SMTPTransport.Options = {
  host: getEnv("SMTP_HOST"),
  port: Number(getEnv("SMTP_PORT")),
  auth: {
    user: getEnv("SMTP_USER"),
    pass: getEnv("SMTP_PASS"),
  },
}

export const transporter = nodemailer.createTransport(smtpOptions)

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
    from: process.env.SMTP_FROM || "CRMS <no-reply@example.com>",
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  })
  console.log("📨 Email sent:", info.messageId)
}
