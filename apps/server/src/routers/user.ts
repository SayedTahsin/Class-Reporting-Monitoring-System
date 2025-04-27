import { eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { user } from '../db/schema/auth'
import { router, protectedProcedure, publicProcedure } from '../lib/trpc'

export const userRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db.select().from(user)
  }),

  getById: protectedProcedure.query(async ({ ctx }) => {
    const userID = ctx.session.user.id
    return await db.select().from(user).where(eq(user.id, userID))
  }),

  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const now = new Date()
    const userID = ctx.session.user.id
    await db
      .update(user)
      .set({
        deletedAt: now,
        updatedAt: now
      })
      .where(eq(user.id, userID))
    return { success: true }
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        image: z.string().optional(),
        username: z.string().optional(),
        batchId: z.string().optional(),
        role: z.string().optional(), 
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userID = ctx.session.user.id
      const now = new Date()

      if (Object.keys(input).length === 0) {
        throw new Error("No fields provided for update.")
      }

      await db
        .update(user)
        .set({
          ...input,
          updatedAt: now,
        })
        .where(eq(user.id, userID))

      return { success: true }
    }),
})
