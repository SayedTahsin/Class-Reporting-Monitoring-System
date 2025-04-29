import { sqliteTable, text, integer, primaryKey, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { slot } from "./slot";
import { batch } from "./batch";
import { course } from "./course";
import { user } from "./auth";
import { room } from "./room";
import { auditColumns } from './audit_column';


export const classSchedule = sqliteTable("class_schedule", {
  date: integer("date", { mode: "timestamp_ms" }).notNull(),
  slotId: integer("slot_id").notNull().references(() => slot.id),
  batchId: text("batch_id").notNull().references(() => batch.id),
  courseId: text("course_id").notNull().references(() => course.id),
  teacherId: text("teacher_id").notNull().references(() => user.id),
  roomId: text("room_id").notNull().references(() => room.id),
  status: text("status", { enum: ['delivered', 'notdelivered', 'rescheduled'] }).notNull().default('notdelivered'),

  ...auditColumns
}, (table) => {
  return [
    primaryKey({ columns: [table.date, table.slotId] }),
    uniqueIndex("data_slot_room").on(table.date, table.slotId, table.roomId),
    uniqueIndex("date_slot_teacher").on(table.date, table.slotId, table.teacherId),
    index("schedule_batch").on(table.batchId),
    index("schedule_course").on(table.courseId),
    index("schedule_teacher").on(table.teacherId),
    index("schedule_room").on(table.roomId),
    index("schedule_slot").on(table.slotId)
  ];
});