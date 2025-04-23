import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const subject = sqliteTable("subject", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});
