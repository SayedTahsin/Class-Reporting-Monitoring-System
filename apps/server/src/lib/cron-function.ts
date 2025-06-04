import { type Day, nextDay } from "date-fns"
import { db } from "../db"
import { classHistory } from "../db/schema/class_history"
import { classSchedule } from "../db/schema/class_schedule"

const dayToIndex: Record<string, Day> = {
  sunday: 0 as Day,
  monday: 1 as Day,
  tuesday: 2 as Day,
  wednesday: 3 as Day,
  thursday: 4 as Day,
  friday: 5 as Day,
  saturday: 6 as Day,
}

function toUTCDateOnly(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
}

export async function generateWeeklyClassHistory() {
  try {
    const now = new Date()

    const schedules = await db.select().from(classSchedule)

    const historyEntries = schedules.map((schedule) => {
      const targetWeekday = dayToIndex[schedule.day]
      const rawDate = nextDay(now, targetWeekday)
      const classDate = toUTCDateOnly(rawDate)

      return {
        date: classDate,
        slotId: schedule.slotId,
        sectionId: schedule.sectionId,
        teacherId: schedule.teacherId,
        roomId: schedule.roomId,
        courseId: schedule.courseId,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: null,
      }
    })

    console.log(
      `Generating ${historyEntries.length} weekly class history entries`,
    )
    await db.insert(classHistory).values(historyEntries).onConflictDoNothing()
    console.log("Weekly class history generation completed successfully")
  } catch (error) {
    console.error("Error generating weekly class history:", error)
    throw error
  }
}
