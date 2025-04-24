import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { auditColumns } from './audit_column';

export const slot = sqliteTable("slot", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),

  ...auditColumns
});


// ---faced some syntax issues with the check constraint

// import { sql } from "drizzle-orm";
// import { sqliteTable, text, integer,check } from "drizzle-orm/sqlite-core";
// import { auditColumns } from './audit_column';

// export const slot = sqliteTable("slot", {
//   id: integer("id").primaryKey({ autoIncrement: true }),
//   startTime: text("start_time").notNull(),
//   endTime: text("end_time").notNull(),

//   ...auditColumns
// },(table)=>[
//   check("time_format", sql`CHECK (
//     ${table.startTime} GLOB '[0-2][0-9]:[0-5][0-9]' AND
//     ${table.endTime} GLOB '[0-2][0-9]:[0-5][0-9]' AND
//     ${table.startTime} < ${table.endTime}
//   )`),
// ]);
