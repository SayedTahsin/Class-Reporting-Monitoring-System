import { checkPermission } from "@/lib/helpers/checkPermission"
import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { db } from "../db"
import { classSchedule } from "../db/schema/class_schedule"
import { protectedProcedure, router } from "../lib/trpc"

const classScheduleKeySchema = z.object({
  day: z.enum([
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ]),
  slotId: z.string(),
})

export const classScheduleRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db
      .select()
      .from(classSchedule)
      .where(isNull(classSchedule.deletedAt))
  }),

  getByDaySlot: protectedProcedure
    .input(classScheduleKeySchema)
    .query(async ({ input }) => {
      return await db
        .select()
        .from(classSchedule)
        .where(
          and(
            eq(classSchedule.day, input.day),
            eq(classSchedule.slotId, input.slotId),
          ),
        )
    }),

  getByTeacherId: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await db
        .select()
        .from(classSchedule)
        .where(eq(classSchedule.teacherId, input.teacherId))
    }),

  delete: protectedProcedure
    .input(classScheduleKeySchema)
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.session.user.id, "*")

      await db
        .delete(classSchedule)
        .where(
          and(
            eq(classSchedule.day, input.day),
            eq(classSchedule.slotId, input.slotId),
          ),
        )

      return { success: true }
    }),

  update: protectedProcedure
    .input(
      classScheduleKeySchema.extend({
        sectionId: z.string(),
        courseId: z.string().optional(),
        teacherId: z.string().optional(),
        roomId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { day, slotId, sectionId, ...updateData } = input
      const now = new Date()

      if (Object.keys(updateData).length === 0) {
        throw new Error("No fields provided for update.")
      }
      try {
        await checkPermission(ctx.session.user.id, "class_schedule:update")
      } catch {
        await checkPermission(ctx.session.user.id, "class_schedule:update_own")

        if (input.teacherId && input.teacherId !== ctx.session.user.id) {
          const err = new Error("You can only update your own schedule.")
          err.name = "ForbiddenError"
          throw err
        }
      }

      await db
        .update(classSchedule)
        .set({
          ...updateData,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
        })
        .where(
          and(
            eq(classSchedule.day, day),
            eq(classSchedule.slotId, slotId),
            eq(classSchedule.sectionId, sectionId),
          ),
        )

      return { success: true }
    }),

  create: protectedProcedure
    .input(
      z.object({
        day: z.enum([
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ]),
        slotId: z.string(),
        sectionId: z.string(),
        courseId: z.string(),
        teacherId: z.string(),
        roomId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await checkPermission(ctx.session.user.id, "*")
      } catch {
        await checkPermission(ctx.session.user.id, "class_schedule:create")
        if (input.teacherId !== ctx.session.user.id) {
          const err = new Error("Invalid TeacherId.")
          err.name = "ForbiddenError"
          throw err
        }
      }

      const now = new Date()
      const newSchedule = await db.insert(classSchedule).values({
        ...input,
        createdAt: now,
        updatedAt: now,
        updatedBy: ctx.session.user.id,
      })

      return { success: true, schedule: newSchedule }
    }),
})
