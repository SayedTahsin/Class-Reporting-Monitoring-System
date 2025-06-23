import { role } from "@/db/schema/pbac"
import { checkPermission } from "@/lib/helpers/checkPermission"
import { type SQL, and, eq, isNull, or, sql } from "drizzle-orm"
import { z } from "zod"
import { db } from "../db"
import { user } from "../db/schema/auth"
import { protectedProcedure, router } from "../lib/trpc"

const paginationSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})

export const userRouter = router({
  getAll: protectedProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx.session.user.id, "user:filter_update_viewAll")
      const hasPagination =
        typeof input?.page === "number" && typeof input?.limit === "number"
      const page = input?.page ?? 1
      const limit = input?.limit ?? 10
      const offset = (page - 1) * limit

      const total = await db
        .select({ count: sql`count(*)` })
        .from(user)
        .where(isNull(user.deletedAt))
        .then((rows) => Number(rows[0]?.count ?? 0))

      const query = db.select().from(user).where(isNull(user.deletedAt))
      if (hasPagination) query.limit(limit).offset(offset)

      const data = await query
      const hasNext = offset + data.length < total
      return { data, total, hasNext }
    }),

  getTeachers: protectedProcedure
    .input(paginationSchema.optional())
    .query(async ({ input }) => {
      const hasPagination =
        typeof input?.page === "number" && typeof input?.limit === "number"
      const page = input?.page ?? 1
      const limit = input?.limit ?? 10
      const offset = (page - 1) * limit

      const total = await db
        .select({ count: sql`count(*)` })
        .from(user)
        .innerJoin(role, eq(user.roleId, role.id))
        .where(and(eq(role.name, "Teacher"), isNull(user.deletedAt)))
        .then((rows) => Number(rows[0]?.count ?? 0))

      const query = db
        .select({
          id: user.id,
          name: user.name,
          username: user.username,
        })
        .from(user)
        .innerJoin(role, eq(user.roleId, role.id))
        .where(and(eq(role.name, "Teacher"), isNull(user.deletedAt)))

      if (hasPagination) query.limit(limit).offset(offset)

      const data = await query
      const hasNext = offset + data.length < total
      return { data, total, hasNext }
    }),

  getStudents: protectedProcedure
    .input(paginationSchema.optional())
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx.session.user.id, "user:filter_update_viewAll")
      const hasPagination =
        typeof input?.page === "number" && typeof input?.limit === "number"
      const page = input?.page ?? 1
      const limit = input?.limit ?? 10
      const offset = (page - 1) * limit

      const total = await db
        .select({ count: sql`count(*)` })
        .from(user)
        .innerJoin(role, eq(user.roleId, role.id))
        .where(and(eq(role.name, "Student"), isNull(user.deletedAt)))
        .then((rows) => Number(rows[0]?.count ?? 0))

      const query = db
        .select({
          id: user.id,
          name: user.name,
          username: user.username,
        })
        .from(user)
        .innerJoin(role, eq(user.roleId, role.id))
        .where(and(eq(role.name, "Student"), isNull(user.deletedAt)))

      if (hasPagination) query.limit(limit).offset(offset)

      const data = await query
      const hasNext = offset + data.length < total
      return { data, total, hasNext }
    }),

  getById: protectedProcedure.query(async ({ ctx }) => {
    return await db.select().from(user).where(eq(user.id, ctx.session.user.id))
  }),

  delete: protectedProcedure.mutation(async ({ ctx }) => {
    await checkPermission(ctx.session.user.id, "*")
    const now = new Date()
    const userID = ctx.session.user.id
    await db
      .update(user)
      .set({
        deletedAt: now,
        updatedAt: now,
        updatedBy: ctx.session.user.id,
        deletedBy: ctx.session.user.id,
      })
      .where(eq(user.id, userID))
    return { success: true }
  }),

  getBySection: protectedProcedure
    .input(
      z.object({
        sectionId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      await checkPermission(ctx.session.user.id, "user:filter_update_viewAll")
      return await db
        .select()
        .from(user)
        .where(eq(user.sectionId, input.sectionId))
    }),

  filter: protectedProcedure
    .input(
      z.object({
        roleId: z.string().optional(),
        sectionId: z.string().optional(),
        q: z.string().optional(),
        page: z.number().min(1).optional(),
        limit: z.number().min(1).max(100).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx.session.user.id, "user:filter_update_viewAll")

      const page = input.page ?? 1
      const limit = input.limit ?? 10
      const offset = (page - 1) * limit

      const whereConditions: Array<unknown | undefined> = [
        isNull(user.deletedAt),
      ]

      if (input.roleId) {
        whereConditions.push(eq(user.roleId, input.roleId))
      }

      if (input.sectionId) {
        whereConditions.push(eq(user.sectionId, input.sectionId))
      }

      if (typeof input.q === "string" && input.q.trim() !== "") {
        whereConditions.push(
          or(
            sql`LOWER(${user.name}) LIKE LOWER(${`%${input.q}%`})`,
            sql`LOWER(${user.username}) LIKE LOWER(${`%${input.q}%`})`,
            sql`LOWER(${user.email}) LIKE LOWER(${`%${input.q}%`})`,
          ),
        )
      }

      const whereClause = and(
        ...whereConditions.filter((c): c is SQL => c !== undefined),
      )

      const total = await db
        .select({ count: sql`count(*)` })
        .from(user)
        .where(whereClause)
        .then((rows) => Number(rows[0]?.count ?? 0))

      const data = await db
        .select()
        .from(user)
        .where(whereClause)
        .limit(limit)
        .offset(offset)

      const hasNext = offset + data.length < total
      return { data, total, hasNext }
    }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        image: z.string().optional(),
        username: z.string().optional(),
        sectionId: z.string().optional(),
        roleId: z.string().optional(),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await checkPermission(ctx.session.user.id, "user:filter_update_viewAll")
      } catch {
        if (input.id !== ctx.session.user.id) {
          const err = new Error("You can only update your own Info.")
          err.name = "ForbiddenError"
          throw err
        }
      }

      const now = new Date()
      const { id, ...mutableFields } = input
      await db
        .update(user)
        .set({
          ...mutableFields,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
        })
        .where(eq(user.id, id))

      return { success: true }
    }),
})
