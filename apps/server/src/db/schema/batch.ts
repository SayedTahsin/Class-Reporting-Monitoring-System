import { createId } from "@/lib/helpers/createId"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { auditColumns } from "./audit_column"
export const batch = sqliteTable("batch", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name").unique().notNull(),

  ...auditColumns,
})
