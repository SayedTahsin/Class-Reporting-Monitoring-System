import { router } from '../lib/trpc'
import { userRouter } from './user'
import { batchRouter } from './batch'
import { roomRouter } from './room'
import { slotRouter } from './slot'
import { courseRouter } from './course'
import { classScheduleRouter } from './class_schedule'
import { roleRouter } from './role'
import { permissionRouter } from './permission'

export const appRouter = router({
  user: userRouter,
  batch: batchRouter,
  room: roomRouter,
  slot: slotRouter,
  course: courseRouter,
  role: roleRouter,
  permission: permissionRouter,
  classSchedule: classScheduleRouter
})
export type AppRouter = typeof appRouter
