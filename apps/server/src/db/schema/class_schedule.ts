import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core"
import { auditColumns } from "./audit_column"
import { user } from "./auth"
import { batch } from "./batch"
import { course } from "./course"
import { room } from "./room"
import { slot } from "./slot"

export const classSchedule = sqliteTable(
  "class_schedule",
  {
    date: integer("date", { mode: "timestamp_ms" }).notNull(),
    slotId: integer("slot_id")
      .notNull()
      .references(() => slot.id, { onDelete: "set null" }),
    batchId: text("batch_id")
      .notNull()
      .references(() => batch.id, { onDelete: "set null" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "set null" }),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    roomId: text("room_id")
      .notNull()
      .references(() => room.id, { onDelete: "set null" }),
    status: text("status", {
      enum: ["delivered", "notdelivered", "rescheduled"],
    })
      .notNull()
      .default("notdelivered"),

    ...auditColumns,
  },
  (table) => {
    return [
      primaryKey({ columns: [table.date, table.slotId] }),
      uniqueIndex("data_slot_room").on(table.date, table.slotId, table.roomId),
      uniqueIndex("date_slot_teacher").on(
        table.date,
        table.slotId,
        table.teacherId,
      ),
      index("schedule_batch").on(table.batchId),
      index("schedule_course").on(table.courseId),
      index("schedule_teacher").on(table.teacherId),
      index("schedule_room").on(table.roomId),
      index("schedule_slot").on(table.slotId),
    ]
  },
)
