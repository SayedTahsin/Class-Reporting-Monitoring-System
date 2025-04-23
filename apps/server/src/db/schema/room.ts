import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const room = sqliteTable("room", {
  id: text("id").primaryKey(),  
  name: text("name").notNull(),   
});
