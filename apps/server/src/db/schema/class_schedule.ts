import { createId } from "@/lib/helpers/createId"
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
import { course } from "./course"
import { room } from "./room"
import { section } from "./section"
import { slot } from "./slot"

export const classSchedule = sqliteTable(
  "class_schedule",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    day: text("day", {
      enum: [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
    }).notNull(),

    slotId: integer("slot_id")
      .notNull()
      .references(() => slot.id, { onDelete: "set null" }),
    sectionId: text("section_id")
      .notNull()
      .references(() => section.id, { onDelete: "set null" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "set null" }),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    roomId: text("room_id")
      .notNull()
      .references(() => room.id, { onDelete: "set null" }),

    ...auditColumns,
  },
  (table) => {
    return [
      uniqueIndex("data_slot").on(table.day, table.slotId),
      uniqueIndex("data_slot_room").on(table.day, table.slotId, table.roomId),
      uniqueIndex("date_slot_teacher").on(
        table.day,
        table.slotId,
        table.teacherId,
      ),
      index("schedule_section").on(table.sectionId),
      index("schedule_course").on(table.courseId),
      index("schedule_teacher").on(table.teacherId),
      index("schedule_room").on(table.roomId),
      index("schedule_slot").on(table.slotId),
      index("schedule_day").on(table.day),
    ]
  },
)
