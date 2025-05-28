import { checkPermission } from "@/lib/helpers/checkPermission";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { classHistory } from "../db/schema/class_history";
import { protectedProcedure, router } from "../lib/trpc";

const classHistoryKeySchema = z.object({
  id: z.string(),
});

export const classHistoryRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await db
      .select()
      .from(classHistory)
      .where(isNull(classHistory.deletedAt));
  }),

  getByDate: protectedProcedure
    .input(
      z.object({
        date: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await db
        .select()
        .from(classHistory)
        .where(
          and(
            eq(classHistory.date, new Date(Number(input.date) * 1000)),
            isNull(classHistory.deletedAt)
          )
        );
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await checkPermission(ctx.session.user.id, "*");
      } catch {
        await checkPermission(ctx.session.user.id, "class_history:create");
        if (input.teacherId !== ctx.session.user.id) {
          const err = new Error("Invalid TeacherId.");
          err.name = "ForbiddenError";
          throw err;
        }
      }

      const now = new Date();
      await db.insert(classHistory).values({
        ...input,
        createdAt: now,
        updatedAt: now,
        updatedBy: ctx.session.user.id,
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["delivered", "notdelivered", "rescheduled"]).optional(),
        notes: z.string().optional(),
        slotId: z.string().optional(),
        sectionId: z.string().optional(),
        teacherId: z.string().optional(),
        roomId: z.string().optional(),
        courseId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      const now = new Date();

      if (Object.keys(updateData).length === 0) {
        throw new Error("No fields provided for update.");
      }

      try {
        await checkPermission(ctx.session.user.id, "class_history:update");
      } catch {
        await checkPermission(ctx.session.user.id, "class_history:update_own");

        if (
          updateData.teacherId &&
          updateData.teacherId !== ctx.session.user.id
        ) {
          const err = new Error("You can only update your own history.");
          err.name = "ForbiddenError";
          throw err;
        }
      }

      await db
        .update(classHistory)
        .set({
          ...updateData,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
        })
        .where(and(eq(classHistory.id, id), isNull(classHistory.deletedAt)));

      return { success: true };
    }),

  delete: protectedProcedure
    .input(classHistoryKeySchema)
    .mutation(async ({ input, ctx }) => {
      await checkPermission(ctx.session.user.id, "*");
      const now = new Date();

      await db
        .update(classHistory)
        .set({
          deletedAt: now,
          updatedAt: now,
          updatedBy: ctx.session.user.id,
          deletedBy: ctx.session.user.id,
        })
        .where(
          and(eq(classHistory.id, input.id), isNull(classHistory.deletedAt))
        );

      return { success: true };
    }),
});
