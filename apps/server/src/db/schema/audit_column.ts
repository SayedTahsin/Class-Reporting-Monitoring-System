import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";

export const auditColumns = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),

  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
};
