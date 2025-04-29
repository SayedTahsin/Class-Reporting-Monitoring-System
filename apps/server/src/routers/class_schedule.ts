import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { db } from "../db"
import { classSchedule } from "../db/schema/class_schedule"
import { protectedProcedure, router } from "../lib/trpc"

const classScheduleKeySchema = z.object({
  date: z.coerce.date(),
  slotId: z.number(),
})

export const classScheduleRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db
      .select()
      .from(classSchedule)
      .where(isNull(classSchedule.deletedAt))
  }),

  getById: protectedProcedure
    .input(classScheduleKeySchema)
    .mutation(async ({ input }) => {
      return await db
        .select()
        .from(classSchedule)
        .where(
          and(
            eq(classSchedule.date, input.date),
            eq(classSchedule.slotId, input.slotId),
          ),
        )
    }),

  delete: protectedProcedure
    .input(classScheduleKeySchema)
    .mutation(async ({ input, ctx }) => {
      const now = new Date()
      await db
        .update(classSchedule)
        .set({
          deletedAt: now,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
          deletedBy: ctx.session.user.id,
        })
        .where(
          and(
            eq(classSchedule.date, input.date),
            eq(classSchedule.slotId, input.slotId),
          ),
        )
      return { success: true }
    }),

  update: protectedProcedure
    .input(
      classScheduleKeySchema.extend({
        batchId: z.string().optional(),
        courseId: z.string().optional(),
        teacherId: z.string().optional(),
        roomId: z.string().optional(),
        status: z.enum(["delivered", "notdelivered", "rescheduled"]).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { date, slotId, ...updateData } = input
      const now = new Date()

      if (Object.keys(updateData).length === 0) {
        throw new Error("No fields provided for update.")
      }

      await db
        .update(classSchedule)
        .set({
          ...updateData,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
        })
        .where(
          and(eq(classSchedule.date, date), eq(classSchedule.slotId, slotId)),
        )

      return { success: true }
    }),

  create: protectedProcedure
    .input(
      z.object({
        date: z.coerce.date(),
        slotId: z.number(),
        batchId: z.string(),
        courseId: z.string(),
        teacherId: z.string(),
        roomId: z.string(),
        status: z.enum(["delivered", "notdelivered", "rescheduled"]).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const now = new Date()

      const newSchedule = await db.insert(classSchedule).values({
        ...input,
        status: input.status ?? "notdelivered",
        createdAt: now,
        updatedAt: now,
        updatedBy: ctx.session.user.id,
      })

      return { success: true, schedule: newSchedule }
    }),
})
