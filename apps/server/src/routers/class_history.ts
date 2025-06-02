import { checkPermission } from "@/lib/helpers/checkPermission"
import { and, between, eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { db } from "../db"
import { classHistory } from "../db/schema/class_history"
import { protectedProcedure, router } from "../lib/trpc"

const classHistoryKeySchema = z.object({
  id: z.string(),
})

export const classHistoryRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db
      .select()
      .from(classHistory)
      .where(isNull(classHistory.deletedAt))
  }),

  getByDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ input }) => {
      const targetDate = new Date(Number(input.date) * 1000)
      return await db
        .select()
        .from(classHistory)
        .where(
          and(
            eq(classHistory.date, targetDate),
            isNull(classHistory.deletedAt),
          ),
        )
    }),

  getByTeacherId: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const conditions = [
        eq(classHistory.teacherId, input.teacherId),
        isNull(classHistory.deletedAt),
      ]

      if (input.from) {
        const fromDate = new Date(Number(input.from) * 1000)
        const toDate = new Date(
          Number(input.to ?? `${Math.floor(Date.now() / 1000)}`) * 1000,
        )
        conditions.push(between(classHistory.date, fromDate, toDate))
      }

      const results = await db
        .select()
        .from(classHistory)
        .where(and(...conditions))

      const deliveredCount = results.filter(
        (r) => r.status === "delivered",
      ).length
      const notDeliveredCount = results.filter(
        (r) => r.status === "notdelivered",
      ).length
      const rescheduledCount = results.filter(
        (r) => r.status === "rescheduled",
      ).length

      return {
        list: results,
        deliveredCount,
        notDeliveredCount,
        rescheduledCount,
      }
    }),

  getBySectionId: protectedProcedure
    .input(
      z.object({
        sectionId: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const conditions = [
        eq(classHistory.sectionId, input.sectionId),
        isNull(classHistory.deletedAt),
      ]

      if (input.from) {
        const fromDate = new Date(Number(input.from) * 1000)
        const toDate = new Date(
          Number(input.to ?? `${Math.floor(Date.now() / 1000)}`) * 1000,
        )
        conditions.push(between(classHistory.date, fromDate, toDate))
      }

      const results = await db
        .select()
        .from(classHistory)
        .where(and(...conditions))

      const deliveredCount = results.filter(
        (r) => r.status === "delivered",
      ).length
      const notDeliveredCount = results.filter(
        (r) => r.status === "notdelivered",
      ).length
      const rescheduledCount = results.filter(
        (r) => r.status === "rescheduled",
      ).length

      return {
        list: results,
        deliveredCount,
        notDeliveredCount,
        rescheduledCount,
      }
    }),
  getByCourseId: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const conditions = [
        eq(classHistory.courseId, input.courseId),
        isNull(classHistory.deletedAt),
      ]

      if (input.from) {
        const fromDate = new Date(Number(input.from) * 1000)
        const toDate = new Date(
          Number(input.to ?? `${Math.floor(Date.now() / 1000)}`) * 1000,
        )
        conditions.push(between(classHistory.date, fromDate, toDate))
      }

      const results = await db
        .select()
        .from(classHistory)
        .where(and(...conditions))

      const deliveredCount = results.filter(
        (r) => r.status === "delivered",
      ).length
      const notDeliveredCount = results.filter(
        (r) => r.status === "notdelivered",
      ).length
      const rescheduledCount = results.filter(
        (r) => r.status === "rescheduled",
      ).length

      return {
        list: results,
        deliveredCount,
        notDeliveredCount,
        rescheduledCount,
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        date: z.date(),
        slotId: z.string(),
        sectionId: z.string(),
        teacherId: z.string(),
        roomId: z.string(),
        courseId: z.string(),
        status: z.enum(["delivered", "notdelivered", "rescheduled"]).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await checkPermission(ctx.session.user.id, "*")
      } catch {
        await checkPermission(ctx.session.user.id, "class_history:create")
        if (input.teacherId !== ctx.session.user.id) {
          const err = new Error("Invalid TeacherId.")
          err.name = "ForbiddenError"
          throw err
        }
      }

      const now = new Date()
      await db.insert(classHistory).values({
        ...input,
        createdAt: now,
        updatedAt: now,
        updatedBy: ctx.session.user.id,
      })
      return { success: true }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["delivered", "notdelivered", "rescheduled"]).optional(),
        notes: z.string().optional(),
        slotId: z.string().optional(),
        sectionId: z.string(),
        teacherId: z.string().optional(),
        roomId: z.string().optional(),
        courseId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input
      const now = new Date()

      if (Object.keys(updateData).length === 0) {
        throw new Error("No fields provided for update.")
      }

      try {
        await checkPermission(ctx.session.user.id, "class_history:update")
      } catch {
        try {
          await checkPermission(ctx.session.user.id, "class_history:update_own")
          if (
            updateData.teacherId &&
            updateData.teacherId !== ctx.session.user.id
          ) {
            const err = new Error("You can only update your own history.")
            err.name = "ForbiddenError"
            throw err
          }
        } catch {
          await checkPermission(
            ctx.session.user.id,
            "class_history:update_own_section",
          )
        }
      }

      await db
        .update(classHistory)
        .set({
          ...updateData,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
        })
        .where(and(eq(classHistory.id, id), isNull(classHistory.deletedAt)))

      return { success: true }
    }),

  delete: protectedProcedure
    .input(classHistoryKeySchema)
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.session.user.id, "*")
      const now = new Date()

      await db
        .update(classHistory)
        .set({
          deletedAt: now,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
          deletedBy: ctx.session.user.id,
        })
        .where(
          and(eq(classHistory.id, input.id), isNull(classHistory.deletedAt)),
        )

      return { success: true }
    }),
})
