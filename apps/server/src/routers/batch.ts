import { eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { batch } from '../db/schema/batch'
import { router, protectedProcedure } from '../lib/trpc'

export const batchRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db.select().from(batch).where(isNull(batch.deletedAt)) 
  }),

  getById: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    return await db.select().from(batch).where(eq(batch.id, input.id))
  }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const now = new Date()
      await db
        .update(batch)
        .set({
          deletedAt: now,
          updatedAt: now,
        })
        .where(eq(batch.id, input.id))
      return { success: true }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input
      const now = new Date()

      if (Object.keys(updateData).length === 0) {
        throw new Error('No fields provided for update.')
      }

      await db
        .update(batch)
        .set({
          ...updateData,
          updatedAt: now,
        })
        .where(eq(batch.id, id))

      return { success: true }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const now = new Date()
      const newBatch = await db.insert(batch).values({
        name: input.name,
        createdAt: now,
        updatedAt: now,
      })

      return { success: true, batch: newBatch }
    }),
})
