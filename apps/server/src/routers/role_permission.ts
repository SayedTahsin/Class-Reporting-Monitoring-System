import { and, eq } from "drizzle-orm"
import { z } from "zod"
import { db } from "../db"
import { permission, role, rolePermission } from "../db/schema/pbac"
import { protectedProcedure, router } from "../lib/trpc"

export const rolePermissionRouter = router({
  getPermissionsByRoleId: protectedProcedure
    .input(z.object({ roleId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select({
          permissionId: rolePermission.permissionId,
          permissionName: permission.name,
          permissionDescription: permission.description,
        })
        .from(rolePermission)
        .leftJoin(permission, eq(rolePermission.permissionId, permission.id))
        .where(eq(rolePermission.roleId, input.roleId))
    }),

  getRolesByPermissionId: protectedProcedure
    .input(z.object({ permissionId: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select({
          roleId: rolePermission.roleId,
          roleName: role.name,
        })
        .from(rolePermission)
        .leftJoin(role, eq(rolePermission.roleId, role.id))
        .where(eq(rolePermission.permissionId, input.permissionId))
    }),

  assign: protectedProcedure
    .input(
      z.object({
        roleId: z.string(),
        permissionId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(rolePermission).values({
        roleId: input.roleId,
        permissionId: input.permissionId,
      })
      return { success: true }
    }),

  remove: protectedProcedure
    .input(
      z.object({
        roleId: z.string(),
        permissionId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(rolePermission)
        .where(
          and(
            eq(rolePermission.roleId, input.roleId),
            eq(rolePermission.permissionId, input.permissionId),
          ),
        )
      return { success: true }
    }),
})
