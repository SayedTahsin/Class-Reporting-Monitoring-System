import { checkPermission } from "@/lib/helpers/checkPermission"
import { and, eq, ilike, isNull, or, sql } from "drizzle-orm"
import { z } from "zod"
import { db } from "../db"
import { course } from "../db/schema/course"
import { protectedProcedure, router } from "../lib/trpc"

const paginationSchema = z.object({
  page: z.number().min(1).optional(), // default: 1
  limit: z.number().min(1).max(100).optional(), // default: 10
})

export const courseRouter = router({
  getAll: protectedProcedure
    .input(paginationSchema.optional())
    .query(async ({ input }) => {
      const hasPagination =
        input?.page !== undefined && input?.limit !== undefined
      const page = input?.page ?? 1
      const limit = input?.limit ?? 10
      const offset = (page - 1) * limit

      const total = await db
        .select({ count: sql`count(*)` })
        .from(course)
        .where(isNull(course.deletedAt))
        .then((rows) => Number(rows[0]?.count ?? 0))

      const query = db.select().from(course).where(isNull(course.deletedAt))
      if (hasPagination) {
        query.limit(limit).offset(offset)
      }
      const data = await query
      const hasNext = offset + data.length < total
      return { data, total, hasNext }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(course)
        .where(and(eq(course.id, input.id), isNull(course.deletedAt)))
        .limit(1)
    }),

  search: protectedProcedure
    .input(
      z.object({
        q: z.string().min(1),
        page: z.number().min(1).optional(),
        limit: z.number().min(1).max(100).optional(),
      }),
    )
    .query(async ({ input }) => {
      const hasPagination =
        input.page !== undefined && input.limit !== undefined
      const page = input.page ?? 1
      const limit = input.limit ?? 10
      const offset = (page - 1) * limit

      const total = await db
        .select({ count: sql`count(*)` })
        .from(course)
        .where(
          and(
            isNull(course.deletedAt),
            or(
              sql`LOWER(${course.title}) LIKE LOWER(${`%${input.q}%`})`,
              sql`LOWER(${course.code}) LIKE LOWER(${`%${input.q}%`})`,
            ),
          ),
        )
        .then((rows) => Number(rows[0]?.count ?? 0))

      const query = db
        .select()
        .from(course)
        .where(
          and(
            isNull(course.deletedAt),
            or(
              sql`LOWER(${course.title}) LIKE LOWER(${`%${input.q}%`})`,
              sql`LOWER(${course.code}) LIKE LOWER(${`%${input.q}%`})`,
            ),
          ),
        )
      if (hasPagination) {
        query.limit(limit).offset(offset)
      }
      const data = await query
      const hasNext = offset + data.length < total
      return { data, total, hasNext }
    }),

  searchByCredits: protectedProcedure
    .input(
      z.object({
        q: z.string().min(1),
        credits: z.number().positive(),
        page: z.number().min(1).optional(),
        limit: z.number().min(1).max(100).optional(),
      }),
    )
    .query(async ({ input }) => {
      const hasPagination =
        input.page !== undefined && input.limit !== undefined
      const page = input.page ?? 1
      const limit = input.limit ?? 10
      const offset = (page - 1) * limit

      const total = await db
        .select({ count: sql`count(*)` })
        .from(course)
        .where(
          and(
            isNull(course.deletedAt),
            eq(course.credits, input.credits),
            or(
              sql`LOWER(${course.title}) LIKE LOWER(${`%${input.q}%`})`,
              sql`LOWER(${course.code}) LIKE LOWER(${`%${input.q}%`})`,
            ),
          ),
        )
        .then((rows) => Number(rows[0]?.count ?? 0))

      const query = db
        .select()
        .from(course)
        .where(
          and(
            isNull(course.deletedAt),
            eq(course.credits, input.credits),
            or(
              sql`LOWER(${course.title}) LIKE LOWER(${`%${input.q}%`})`,
              sql`LOWER(${course.code}) LIKE LOWER(${`%${input.q}%`})`,
            ),
          ),
        )
      if (hasPagination) {
        query.limit(limit).offset(offset)
      }
      const data = await query
      const hasNext = offset + data.length < total
      return { data, total, hasNext }
    }),

  filterByCredits: protectedProcedure
    .input(
      z
        .object({
          credits: z.number().positive(),
        })
        .merge(paginationSchema),
    )
    .query(async ({ input }) => {
      const hasPagination =
        input?.page !== undefined && input?.limit !== undefined
      const page = input?.page ?? 1
      const limit = input?.limit ?? 10
      const offset = (page - 1) * limit

      const total = await db
        .select({ count: sql`count(*)` })
        .from(course)
        .where(and(isNull(course.deletedAt), eq(course.credits, input.credits)))
        .then((rows) => Number(rows[0]?.count ?? 0))

      const query = db
        .select()
        .from(course)
        .where(and(isNull(course.deletedAt), eq(course.credits, input.credits)))
      if (hasPagination) {
        query.limit(limit).offset(offset)
      }
      const data = await query
      const hasNext = offset + data.length < total
      return { data, total, hasNext }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.session.user.id, "*")
      const now = new Date()
      await db
        .update(course)
        .set({
          deletedAt: now,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
          deletedBy: ctx.session.user.id,
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
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.session.user.id, "course:create_update")
      const { id, ...updateData } = input
      const now = new Date()

      if (Object.keys(updateData).length === 0) {
        throw new Error("No fields provided for update.")
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
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.session.user.id, "course:create_update")
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
