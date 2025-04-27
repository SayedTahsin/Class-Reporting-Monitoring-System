import { eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db'
import { classSchedule } from '../db/schema/class_schedule'
import { router, protectedProcedure } from '../lib/trpc'

export const classScheduleRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db
      .select()
      .from(classSchedule)
      .where(isNull(classSchedule.deletedAt)) 
  }),

//   getById: protectedProcedure
//     .input(z.object({ id: z.string() }))
//     .mutation(async ({ input }) => {
//       return await db
//         .select()
//         .from(classSchedule)
//         .where(eq(classSchedule.id, input.id))
//     }),

//   delete: protectedProcedure
//     .input(z.object({ id: z.string() }))
//     .mutation(async ({ input }) => {
//       const now = new Date()
//       await db
//         .update(classSchedule)
//         .set({
//           deletedAt: now,
//           updatedAt: now,
//         })
//         .where(eq(classSchedule.id, input.id))
//       return { success: true }
//     }),

//   update: protectedProcedure
//     .input(
//       z.object({
//         id: z.string(),
//         date: z.number().optional(),
//         slotId: z.number().optional(),
//         batchId: z.string().optional(),
//         courseId: z.string().optional(),
//         teacherId: z.string().optional(),
//         roomId: z.string().optional(),
//         status: z.enum(['delivered', 'notdelivered', 'rescheduled']).optional(),
//       })
//     )
//     .mutation(async ({ input }) => {
//       const { id, ...updateData } = input
//       const now = new Date()

//       if (Object.keys(updateData).length === 0) {
//         throw new Error('No fields provided for update.')
//       }

//       await db
//         .update(classSchedule)
//         .set({
//           ...updateData,
//           updatedAt: now,
//         })
//         .where(eq(classSchedule.id, id))

//       return { success: true }
//     }),

//   create: protectedProcedure
//     .input(
//       z.object({
//         date: z.number(),
//         slotId: z.number(),
//         batchId: z.string(),
//         courseId: z.string(),
//         teacherId: z.string(),
//         roomId: z.string(),
//         status: z.enum(['delivered', 'notdelivered', 'rescheduled']).default('notdelivered'),
//       })
//     )
//     .mutation(async ({ input }) => {
//       const now = new Date()
//       const newClassSchedule = await db.insert(classSchedule).values({
//         date: input.date,
//         slotId: input.slotId,
//         batchId: input.batchId,
//         courseId: input.courseId,
//         teacherId: input.teacherId,
//         roomId: input.roomId,
//         status: input.status,
//         createdAt: now,
//         updatedAt: now,
//       })

//       return { success: true, classSchedule: newClassSchedule }
//     }),
})
