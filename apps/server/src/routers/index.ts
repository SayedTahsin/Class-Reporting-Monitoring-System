import { protectedProcedure, publicProcedure, router } from '../lib/trpc'
import { todoRouter } from './todo'
import { userRouter } from './user'
import { batchRouter } from './batch'
import { roomRouter } from './room'
import { slotRouter } from './slot'
import { courseRouter } from './course'
import { classScheduleRouter } from './class_schedule'

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return 'OK'
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: 'This is private',
      user: ctx.session.user
    }
  }),
  todo: todoRouter,
  user: userRouter,
  batch: batchRouter,
  room: roomRouter,
  slot: slotRouter,
  course: courseRouter,
  classSchedule: classScheduleRouter
})
export type AppRouter = typeof appRouter
