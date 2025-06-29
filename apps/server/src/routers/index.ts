import { router } from "../lib/trpc"
import { classHistoryRouter } from "./class_history"
import { classScheduleRouter } from "./class_schedule"
import { courseRouter } from "./course"
import { permissionRouter } from "./permission"
import { roleRouter } from "./role"
import { rolePermissionRouter } from "./role_permission"
import { roomRouter } from "./room"
import { sectionRouter } from "./section"
import { slotRouter } from "./slot"
import { supabaseRouter } from "./supabase_storage"
import { userRouter } from "./user"
import { userRoleRouter } from "./user_role"

export const appRouter = router({
  user: userRouter,
  section: sectionRouter,
  room: roomRouter,
  slot: slotRouter,
  course: courseRouter,
  role: roleRouter,
  permission: permissionRouter,
  classSchedule: classScheduleRouter,
  classHistory: classHistoryRouter,
  userRole: userRoleRouter,
  rolePermission: rolePermissionRouter,
  supabase: supabaseRouter,
})
export type AppRouter = typeof appRouter
