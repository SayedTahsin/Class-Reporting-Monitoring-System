import { eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { course } from '../db/schema/course'
import { router, protectedProcedure } from '../lib/trpc'

export const courseRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db
      .select()
      .from(course)
      .where(isNull(course.deletedAt)) 
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.select().from(course).where(eq(course.id, input.id))
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input,ctx }) => {
      const now = new Date()
      await db
        .update(course)
        .set({
          deletedAt: now,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
          deletedBy: ctx.session.user.id
        })
        .where(eq(course.id, input.id))
      return { success: true }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        code: z.string().optional(),
        title: z.string().optional(),
        credits: z.number().positive().optional(), 
      })
    )
    .mutation(async ({ input,ctx }) => {
      const { id, ...updateData } = input
      const now = new Date()

      if (Object.keys(updateData).length === 0) {
        throw new Error('No fields provided for update.')
      }

      await db
        .update(course)
        .set({
          ...updateData,
          updatedAt: now,
          updatedBy: ctx.session.user.id,

        })
        .where(eq(course.id, id))

      return { success: true }
    }),

  create: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        title: z.string(),
        credits: z.number().positive(),
      })
    )
    .mutation(async ({ input,ctx }) => {
      const now = new Date()
      const newCourse = await db.insert(course).values({
        code: input.code,
        title: input.title,
        credits: input.credits,
        createdAt: now,
        updatedAt: now,
        updatedBy: ctx.session.user.id,

      })

      return { success: true, course: newCourse }
    }),
})
