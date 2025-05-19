import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core"
import { auditColumns } from "./audit_column"
import { user } from "./auth"
import { classSchedule } from "./class_schedule"
import { room } from "./room"
import { section } from "./section"
import { slot } from "./slot"
export const classHistory = sqliteTable(
  "class_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    date: integer("date", { mode: "timestamp_ms" }).notNull(),

    slotId: integer("slot_id")
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

    scheduleId: integer("schedule_id")
      .notNull()
      .references(() => classSchedule.id, {
        onDelete: "set null",
      }),

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
        table.sectionId,
      ),
      index("classhistory_teacher").on(table.teacherId),
      index("classhistory_room").on(table.roomId),
      index("classhistory_section").on(table.sectionId),
      index("classsession_schedule").on(table.scheduleId),
    ]
  },
)
