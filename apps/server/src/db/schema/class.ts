import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { slot } from "./slot";
import { batch } from "./batch";
import { subject } from "./subject";
import { user } from "./user";
import { room } from "./room";

export const classSchedule = sqliteTable("class", {
  date: integer("date", { mode: "timestamp" }).notNull(), 
  day: text("day").notNull(),
  slotId: integer("slot_id").notNull().references(() => slot.id),
  batchId: text("batch_id").notNull().references(() => batch.id),
  subjectId: text("subject_id").notNull().references(() => subject.id),
  teacherId: text("teacher_id").notNull().references(() => user.id),
  roomId: text("room_id").notNull().references(() => room.id),
  status: text("status", { enum: ['delivered', 'notdelivered', 'rescheduled'] }).notNull(),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
},(table)=>[
    primaryKey({ columns: [table.date, table.day, table.slotId] }),
]);
