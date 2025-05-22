import { checkPermission } from "@/lib/helpers/checkPermission"
import { eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { db } from "../db"
import { room } from "../db/schema/room"
import { protectedProcedure, router } from "../lib/trpc"

export const roomRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await db.select().from(room).where(isNull(room.deletedAt))
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
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
