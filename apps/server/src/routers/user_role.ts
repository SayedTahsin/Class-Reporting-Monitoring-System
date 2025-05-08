import { user } from "@/db/schema/auth"
import { and, eq } from "drizzle-orm"
import { z } from "zod"
import { db } from "../db"
import { role, userRole } from "../db/schema/pbac"
import { protectedProcedure, router } from "../lib/trpc"

export const userRoleRouter = router({
  getRolesByUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select({
          roleId: userRole.roleId,
          roleName: role.name,
          roleDescription: role.description,
        })
        .from(userRole)
        .leftJoin(role, eq(userRole.roleId, role.id))
        .where(eq(userRole.userId, input.userId))
    }),

  getUsersByRoleId: protectedProcedure
    .input(z.object({ roleId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select({
          userId: userRole.userId,
          userName: user.name,
          userEmail: user.email,
        })
        .from(userRole)
        .leftJoin(user, eq(userRole.userId, user.id))
        .where(eq(userRole.roleId, input.roleId))
    }),

  assign: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        roleId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(userRole).values({
        userId: input.userId,
        roleId: input.roleId,
      })
      return { success: true }
    }),

  remove: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        roleId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(userRole)
        .where(
          and(
            eq(userRole.userId, input.userId),
            eq(userRole.roleId, input.roleId),
          ),
        )
      return { success: true }
    }),
})
