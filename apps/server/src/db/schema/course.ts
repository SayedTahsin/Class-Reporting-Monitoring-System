import { createId } from "@/lib/helpers/createId"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { auditColumns } from "./audit_column"

export const course = sqliteTable("course", {
  id: text("id").primaryKey().$defaultFn(createId),
  code: text("code").unique().notNull(),
  title: text("title").notNull(),
  credits: integer("credits").notNull(),
  ...auditColumns,
})
