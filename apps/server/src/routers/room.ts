import { checkPermission } from "@/lib/helpers/checkPermission"
import { and, eq, isNull, or, sql } from "drizzle-orm"
import { z } from "zod"
import { db } from "../db"
import { room } from "../db/schema/room"
import { protectedProcedure, router } from "../lib/trpc"

const paginationSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})

export const roomRouter = router({
  getAll: protectedProcedure
    .input(paginationSchema.optional())
    .query(async ({ input }) => {
      const hasPagination =
        typeof input?.page === "number" && typeof input?.limit === "number"
      const page = input?.page ?? 1
      const limit = input?.limit ?? 10
      const offset = (page - 1) * limit

      const total = await db
        .select({ count: sql`count(*)` })
        .from(room)
        .where(isNull(room.deletedAt))
        .then((rows) => Number(rows[0]?.count ?? 0))

      const query = db.select().from(room).where(isNull(room.deletedAt))

      if (hasPagination) {
        query.limit(limit).offset(offset)
      }

      const data = await query
      const hasNext = offset + data.length < total
      return { data, total, hasNext }
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
        typeof input?.page === "number" && typeof input?.limit === "number"
      const page = input.page ?? 1
      const limit = input.limit ?? 10
      const offset = (page - 1) * limit

      const total = await db
        .select({ count: sql`count(*)` })
        .from(room)
        .where(
          and(
            isNull(room.deletedAt),
            or(
              sql`LOWER(${room.name}) LIKE LOWER(${`%${input.q}%`})`,
              sql`LOWER(${room.description}) LIKE LOWER(${`%${input.q}%`})`,
            ),
          ),
        )
        .then((rows) => Number(rows[0]?.count ?? 0))

      const query = db
        .select()
        .from(room)
        .where(
          and(
            isNull(room.deletedAt),
            or(
              sql`LOWER(${room.name}) LIKE LOWER(${`%${input.q}%`})`,
              sql`LOWER(${room.description}) LIKE LOWER(${`%${input.q}%`})`,
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

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await db.select().from(room).where(eq(room.id, input.id))
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.session.user.id, "*")
      await db.delete(room).where(eq(room.id, input.id))
      return { success: true }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.session.user.id, "room:create_update")
      const { id, ...updateData } = input
      const now = new Date()

      if (Object.keys(updateData).length === 0) {
        throw new Error("No fields provided for update.")
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
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.session.user.id, "room:create_update")
      const now = new Date()
      const newRoom = await db.insert(room).values({
        name: input.name,
        description: input.description,
        createdAt: now,
        updatedAt: now,
        updatedBy: ctx.session.user.id,
      })

      return { success: true, room: newRoom }
    }),
})
