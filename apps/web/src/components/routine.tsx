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
      <CardContent className="space-y-8">
        <Label className="text-2xl">Weekly Routine</Label>
        {weekdays.map((day) => (
          <div key={day} className="flex items-start">
            <div
              className="flex flex-col items-center justify-center border-gray-300 border-r pr-2 font-bold text-lg"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "upright",
                minHeight: `${Math.max(200, slots.length * 40)}px`,
              }}
            >
              {day.toUpperCase()}
            </div>

            <div className="flex-1 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="border border-gray-300 px-4 py-2">
                      Slot / Section
                    </TableHead>
                    {sections.map((section) => (
                      <TableHead
                        key={section.id}
                        className="border border-gray-300 px-4 py-2"
                      >
                        {section.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="border border-gray-300 px-4 py-2 font-medium">
                        {slot.startTime} - {slot.endTime}
                      </TableCell>
                      {sections.map((section) => {
                        const item = getScheduleItem(day, slot.id, section.id)
                        return (
                          <TableCell
                            key={section.id}
                            className="border border-gray-300 px-4 py-2"
                          >
                            {item ? (
                              <div className="space-y-1 whitespace-nowrap text-sm">
                                <div>
                                  {courses.find((c) => c.id === item?.courseId)
                                    ?.title || "-"}
                                </div>
                                <div>
                                  {teachers.find(
                                    (t) => t.id === item?.teacherId,
                                  )?.name || "-"}
                                </div>
                                <div>
                                  {rooms.find((r) => r.id === item?.roomId)
                                    ?.name || "-"}
                                </div>
                              </div>
                            ) : null}
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
