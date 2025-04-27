import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@/lib/helpers/createId";
import { auditColumns } from './audit_column';

export const course = sqliteTable("course", {
  id: text("id").primaryKey().$defaultFn(createId),
  code: text("name").unique().notNull(),
  title: text("title").notNull(),
  credits: integer("credits").notNull(),
 ...auditColumns
});