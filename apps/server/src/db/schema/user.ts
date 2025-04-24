import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { createId } from "@/lib/helpers/createId";
import { batch } from "./batch";
import { auditColumns } from './audit_column';

export const user = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(createId),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
  image: text("image"),
  batchId: text("batch_id").notNull().references(() => batch.id),
  phone: text("phone").notNull(),
  role: text("role").notNull(),

  ...auditColumns
}, (table) => {
  return [
    index("user_batch").on(table.batchId)
  ];
});