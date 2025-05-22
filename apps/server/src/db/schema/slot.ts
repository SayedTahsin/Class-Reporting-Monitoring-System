import { createId } from "@/lib/helpers/createId"
import { sql } from "drizzle-orm"
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { auditColumns } from "./audit_column"

export const slot = sqliteTable(
  "slot",
  {
    id: text("id").primaryKey().$default(createId),
    slotNumber: integer("slot_number").unique(),
    startTime: text("start_time").notNull().default("00:00"),
    endTime: text("end_time").notNull().default("00:00"),

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
