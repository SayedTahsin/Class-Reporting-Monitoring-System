import { createId } from "@/lib/helpers/createId"
import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { auditColumns } from "./audit_column"
import { user } from "./auth"

export const role = sqliteTable("role", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name").unique().notNull(),
  description: text("description"),
  ...auditColumns,
})

export const permission = sqliteTable("permission", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name").unique().notNull(),
  description: text("description"),
  ...auditColumns,
})

export const userRole = sqliteTable(
  "user_role",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    roleId: text("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "set null" }),
  },
  (table) => {
    return [primaryKey({ columns: [table.userId, table.roleId] })]
  },
)

export const rolePermission = sqliteTable(
  "role_permission",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "set null" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permission.id, { onDelete: "set null" }),
  },
  (table) => {
    return [primaryKey({ columns: [table.roleId, table.permissionId] })]
  },
)
