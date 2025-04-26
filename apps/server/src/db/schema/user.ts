import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { createId } from "@/lib/helpers/createId";
import { batch } from "./batch";
import { auditColumns } from './audit_column';

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});