import { router } from "../lib/trpc"
import { batchRouter } from "./batch"
import { classScheduleRouter } from "./class_schedule"
import { courseRouter } from "./course"
import { permissionRouter } from "./permission"
import { roleRouter } from "./role"
import { rolePermissionRouter } from "./role_permission"
import { roomRouter } from "./room"
import { slotRouter } from "./slot"
import { userRouter } from "./user"
import { userRoleRouter } from "./user_role"

export const appRouter = router({
  user: userRouter,
  batch: batchRouter,
  room: roomRouter,
  slot: slotRouter,
  course: courseRouter,
  role: roleRouter,
  permission: permissionRouter,
  classSchedule: classScheduleRouter,
  userRole: userRoleRouter,
  rolePermission: rolePermissionRouter,
})
export type AppRouter = typeof appRouter
