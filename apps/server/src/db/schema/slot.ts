import { sql } from "drizzle-orm"
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { auditColumns } from "./audit_column"

export const slot = sqliteTable(
  "slot",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),

    ...auditColumns,
  },
  (table) => [
    check(
      "time_format",
      sql`
    ${table.startTime} GLOB '[0-2][0-9]:[0-5][0-9]' 
    AND ${table.endTime} GLOB '[0-2][0-9]:[0-5][0-9]' 
    AND ${table.startTime} < ${table.endTime}
  `,
    ),
  ],
)
