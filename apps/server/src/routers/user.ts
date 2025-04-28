import { eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { user } from '../db/schema/auth'
import { router, protectedProcedure } from '../lib/trpc'

export const userRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db.select().from(user).where(isNull(user.deletedAt)) 
  }),

  getById: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    return await db.select().from(user).where(eq(user.id, input.id))
  }),
  

  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const now = new Date()
    const userID = ctx.session.user.id
    await db
      .update(user)
      .set({
        deletedAt: now,
        updatedAt: now,
        updatedBy: ctx.session.user.id,
        deletedBy: ctx.session.user.id
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
          updatedBy: ctx.session.user.id,

        })
        .where(eq(user.id, userID))

      return { success: true }
    }),
})
