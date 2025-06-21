import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { passkey } from "better-auth/plugins/passkey"
import { db } from "../db"
import * as schema from "../db/schema/auth"
import { sendEmail } from "./helpers/sendEmail"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your password",
          html: `
        <p>Hello ${user.email},</p>
        <p>Please click this <a href="${url}">Link</a> to reset your password.</p>
      `,
        })
      } catch (err) {
        console.error("Failed to send reset password email:", err)
      }
    },
  },
  plugins: [passkey()],
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your email address",
          html: `
        <p>Hello ${user.email},</p>
        <p>Please click this <a href="${url}">Link</a> to verify.</p>
      `,
        })
      } catch (err) {
        console.error("Failed to send verification email:", err)
      }
    },
  },
})
