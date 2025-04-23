import { sqliteTable, text,integer } from "drizzle-orm/sqlite-core";

export const slot = sqliteTable("slot", {
  id: integer("id").primaryKey({autoIncrement:true}),     
  startTime: text("start_time").notNull(),  
  endTime: text("end_time").notNull(),     
});