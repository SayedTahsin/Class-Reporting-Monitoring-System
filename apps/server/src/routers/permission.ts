import { eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { permission } from '../db/schema/pbac';
import { router, protectedProcedure } from '../lib/trpc';

export const permissionRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db.select().from(permission).where(isNull(permission.deletedAt));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.select().from(permission).where(eq(permission.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const now = new Date();
      await db.update(permission).set({
        deletedAt: now,
        updatedAt: now,
        updatedBy: ctx.session.user.id,
        deletedBy: ctx.session.user.id,
      }).where(eq(permission.id, input.id));
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      const now = new Date();

      if (Object.keys(updateData).length === 0) {
        throw new Error('No fields provided for update.');
      }

      await db.update(permission).set({
        ...updateData,
        updatedAt: now,
        updatedBy: ctx.session.user.id,
      }).where(eq(permission.id, id));

      return { success: true };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const now = new Date();
      const newPermission = await db.insert(permission).values({
        name: input.name,
        description: input.description,
        createdAt: now,
        updatedAt: now,
        updatedBy: ctx.session.user.id,
      });

      return { success: true, permission: newPermission };
    }),
});
