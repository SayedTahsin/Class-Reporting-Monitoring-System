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

// | Table           | Purpose
// |-----------------|------------------------------
// | role            | Manage roles
// | permission      | Manage available permissions
// | user_role       | Assign roles to users
// | role_permission | Assign permissions to roles

// role

// | id            | name        | description
// |---------------|-------------|-------------------------
// | `r1`          | SuperAdmin  | All access
// | `r2`          | Chairman    | Manage everything except delete
// | `r3`          | Teacher     | Manage classes they teach
// | `r4`          | CR          | Manage classes of their batch
// | `r5`          | Student     | Edit own profile only

// permission

// | id           | name                    | description
// |--------------|-------------------------|-------------------------------
// | `p1`         | `*`                     | Full Access (Super Admin)
// | `p2`         | `user:edit_own`         | Edit own profile
// | `p3`         | `class:edit_teach`      | Teacher edits his classes
// | `p4`         | `class:edit_own_batch`  | CR edits batch classes
// | `p5`         | `user:update`           | General user updates (Chairman)
// | `p6`         | `batch:create`          | Create batches
// | `p7`         | `course:create`         | Create courses
// | `p8`         | `class_schedule:create` | Create class schedule
// | `p9`         | `user:delete`           | Delete users (SuperAdmin only)

// user_role

// | userId       | roleId |
// |--------------|--------|
// | user-1       | r1     | (SuperAdmin) |
// | user-2       | r2     | (Chairman)   |
// | user-3       | r3     | (Teacher)    |
// | user-4       | r4     | (CR)         |
// | user-5       | r5     | (Student)    |

// role_permission
// | roleId | permissionId |
// |--------|--------------|
// | r1     | p1            |
// | r2     | p5            |
// | r2     | p6            |
// | r2     | p7            |
// | r2     | p8            |
// | r3     | p2            |
// | r3     | p3            |
// | r4     | p2            |
// | r4     | p4            |
// | r5     | p2            |
