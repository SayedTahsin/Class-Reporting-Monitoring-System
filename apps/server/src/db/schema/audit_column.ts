import {  integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const auditColumns = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`), 

  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`), 

  deletedAt: integer("deleted_at", { mode: "timestamp" }), 
};
