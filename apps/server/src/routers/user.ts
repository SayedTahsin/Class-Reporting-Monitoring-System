import { role } from "@/db/schema/pbac"
import { checkPermission } from "@/lib/helpers/checkPermission"
import { eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { db } from "../db"
import { user } from "../db/schema/auth"
import { protectedProcedure, router } from "../lib/trpc"

export const userRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    await checkPermission(ctx.session.user.id, "user:filter_update_viewAll")
    return await db.select().from(user).where(isNull(user.deletedAt))
  }),

  getTeachers: protectedProcedure.query(async () => {
    const result = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
      })
      .from(user)
      .innerJoin(role, eq(user.roleId, role.id))
      .where(eq(role.name, "Teacher"))

    return result
  }),

  getStudents: protectedProcedure.query(async ({ ctx }) => {
    await checkPermission(ctx.session.user.id, "user:filter_update_viewAll")
    const result = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
      })
      .from(user)
      .innerJoin(role, eq(user.roleId, role.id))
      .where(eq(role.name, "Student"))

    return result
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

      const userID = input.id
      const now = new Date()

      if (Object.keys(input).length === 0) {
        throw new Error("No fields provided for update.")
      }

      await db
        .update(user)
        .set({
          ...input,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
        })
        .where(eq(user.id, userID))

      return { success: true }
    }),
})
