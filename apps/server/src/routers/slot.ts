import { checkPermission } from "@/lib/helpers/checkPermission"
import { eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { db } from "../db"
import { slot } from "../db/schema/slot"
import { protectedProcedure, router } from "../lib/trpc"

export const slotRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await db.select().from(slot).where(isNull(slot.deletedAt))
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await db.select().from(slot).where(eq(slot.id, input.id))
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.session.user.id, "*")
      const now = new Date()
      await db
        .update(slot)
        .set({
          deletedAt: now,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
          deletedBy: ctx.session.user.id,
        })
        .where(eq(slot.id, input.id))
      return { success: true }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        slotNumber: z.number().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.session.user.id, "slot:create_update")
      const { id, ...updateData } = input
      const now = new Date()

      if (Object.keys(updateData).length === 0) {
        throw new Error("No fields provided for update.")
      }

      await db
        .update(slot)
        .set({
          ...updateData,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
        })
        .where(eq(slot.id, id))

      return { success: true }
    }),

  create: protectedProcedure
    .input(
      z.object({
        slotNumber: z.number(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.session.user.id, "slot:create_update")
      const now = new Date()
      const newSlot = await db.insert(slot).values({
        startTime: input.startTime,
        endTime: input.endTime,
        slotNumber: input.slotNumber,
        createdAt: now,
        updatedAt: now,
        updatedBy: ctx.session.user.id,
      })

      return { success: true, slot: newSlot }
    }),
})
