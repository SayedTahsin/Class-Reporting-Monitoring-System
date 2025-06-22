import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { trpc } from "@/utils/trpc"
import { useQuery } from "@tanstack/react-query"

const weekdays = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
]

const RoutineView = () => {
  const { data: teachersResult = { data: [], total: 0, hasNext: false } } =
    useQuery({
      ...trpc.user.getTeachers.queryOptions(),
    })

  const teachers = teachersResult.data || []
  const { data: courseResult = { data: [], total: 0, hasNext: false } } =
    useQuery({
      ...trpc.course.getAll.queryOptions(),
    })
  const courses = courseResult.data || []
  const { data: roomResult = { data: [], total: 0, hasNext: false } } =
    useQuery({
      ...trpc.room.getAll.queryOptions(),
    })
  const rooms = roomResult.data || []
  const { data: sections = [] } = useQuery(trpc.section.getAll.queryOptions())
  const { data: slots = [] } = useQuery(trpc.slot.getAll.queryOptions())
  const { data: schedules = [], refetch } = useQuery(
    trpc.classSchedule.getAll.queryOptions(),
  )

  const getScheduleItem = (day: string, slotId: string, sectionId: string) => {
    return schedules.find(
      (s) =>
        s.day.toLowerCase() === day.toLowerCase() &&
        s.slotId === slotId &&
        s.sectionId === sectionId,
    )
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <Label className="font-semibold text-xl">Weekly Routine</Label>

        {weekdays.map((day) => (
          <div key={day} className="flex items-start gap-2">
            <div
              className="flex flex-col items-center justify-center border-border border-r pr-2 font-semibold text-base text-muted-foreground"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "upright",
                minHeight: `${Math.max(200, slots.length * 40)}px`,
              }}
            >
              {day.toUpperCase()}
            </div>

            <div className="flex-1 overflow-x-auto rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="border px-3 py-2 text-sm">
                      Slot / Section
                    </TableHead>
                    {sections.map((section) => (
                      <TableHead
                        key={section.id}
                        className="border px-3 py-2 text-sm"
                      >
                        {section.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="whitespace-nowrap border px-3 py-2 font-medium text-sm">
                        {slot.startTime} - {slot.endTime}
                      </TableCell>

                      {sections.map((section) => {
                        const item = getScheduleItem(day, slot.id, section.id)
                        const courseTitle =
                          courses.find((c) => c.id === item?.courseId)?.title ||
                          "-"
                        const teacherName =
                          teachers.find((t) => t.id === item?.teacherId)
                            ?.name || "-"
                        const roomName =
                          rooms.find((r) => r.id === item?.roomId)?.name || "-"

                        return (
                          <TableCell
                            key={section.id}
                            className="whitespace-nowrap border px-3 py-2 text-sm"
                          >
                            {item ? (
                              <div className="space-y-0.5">
                                <div>{courseTitle}</div>
                                <div>{teacherName}</div>
                                <div>{roomName}</div>
                              </div>
                            ) : (
                              <div className="text-muted-foreground">-</div>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default RoutineView
