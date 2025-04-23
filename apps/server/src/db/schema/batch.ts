import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const batch = sqliteTable("batch", {
  id: text("id").primaryKey(),   
  name: text("name"), 
});
