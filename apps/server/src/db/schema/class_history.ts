import { createId } from "@/lib/helpers/createId";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { auditColumns } from "./audit_column";
import { user } from "./auth";
import { course } from "./course";
import { room } from "./room";
import { section } from "./section";
import { slot } from "./slot";

export const classHistory = sqliteTable(
  "class_history",
  {
    id: text("id").primaryKey().$defaultFn(createId),

    date: integer("date", { mode: "timestamp" }).notNull(),

    slotId: text("slot_id")
      .notNull()
      .references(() => slot.id, { onDelete: "set null" }),

    sectionId: text("section_id")
      .notNull()
      .references(() => section.id, { onDelete: "set null" }),

    teacherId: text("teacher_id")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),

    roomId: text("room_id")
      .notNull()
      .references(() => room.id, { onDelete: "set null" }),

    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "set null" }),

    status: text("status", {
      enum: ["delivered", "notdelivered", "rescheduled"],
    })
      .notNull()
      .default("notdelivered"),

    notes: text("notes"),
    ...auditColumns,
  },
  (table) => {
    return [
      uniqueIndex("unique_class_session").on(
        table.date,
        table.slotId,
        table.sectionId
      ),
      index("classhistory_teacher").on(table.teacherId),
      index("classhistory_room").on(table.roomId),
      index("classhistory_section").on(table.sectionId),
      index("classsession_course").on(table.courseId),
    ];
  }
);
