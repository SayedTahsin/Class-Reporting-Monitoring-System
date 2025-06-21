import { createId } from "@/lib/helpers/createId"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { auditColumns } from "./audit_column"
export const section = sqliteTable("section", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name").unique().notNull(),

  ...auditColumns,
})
