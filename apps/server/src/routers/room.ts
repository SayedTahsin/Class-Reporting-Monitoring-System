import { eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { room } from '../db/schema/room'
import { router, protectedProcedure } from '../lib/trpc'

export const roomRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db.select().from(room).where(isNull(room.deletedAt)) 
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.select().from(room).where(eq(room.id, input.id))
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const now = new Date()
      await db
        .update(room)
        .set({
          deletedAt: now,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
          deletedBy: ctx.session.user.id
        })
        .where(eq(room.id, input.id))
      return { success: true }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input
      const now = new Date()

      if (Object.keys(updateData).length === 0) {
        throw new Error('No fields provided for update.')
      }

      await db
        .update(room)
        .set({
          ...updateData,
          updatedAt: now,
          updatedBy: ctx.session.user.id,

        })
        .where(eq(room.id, id))

      return { success: true }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const now = new Date()
      const newRoom = await db.insert(room).values({
        name: input.name,
        createdAt: now,
        updatedAt: now,
        updatedBy: ctx.session.user.id,

      })

      return { success: true, room: newRoom }
    }),
})
