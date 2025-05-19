import { Button } from "@/components/ui/button"
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
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

type EditableField = "teacherId" | "courseId" | "roomId"

type ClassSchedule = {
  id: number
  slotId: number
  sectionId: number
  courseId: string
  teacherId: string
  roomId: string
}

const ClassScheduleTable = () => {
  const { data: schedules = [], refetch } = useQuery(
    trpc.classSchedule.getAll.queryOptions(),
  )

  const { data: teachers = [] } = useQuery(trpc.user.getTeachers.queryOptions())
  const { data: courses = [] } = useQuery(trpc.course.getAll.queryOptions())
  const { data: rooms = [] } = useQuery(trpc.room.getAll.queryOptions())

  const updateSchedule = useMutation(
    trpc.classSchedule.update.mutationOptions({
      onSuccess: () => {
        toast.success("Schedule updated!")
        refetch()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const [editingCell, setEditingCell] = useState<{
    id: number
    field: EditableField
  } | null>(null)

  const [editValue, setEditValue] = useState<string>("")

  const handleDoubleClick = (schedule: ClassSchedule, field: EditableField) => {
    setEditingCell({ id: schedule.id, field })
    setEditValue(schedule[field] ?? "")
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (editingCell) {
      updateSchedule.mutate({
        id: editingCell.id,
        [editingCell.field]: value,
      })
      setEditingCell(null)
      setEditValue("")
    }
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <Label>Class Schedule</Label>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slot</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Room</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>{schedule.slotId}</TableCell>
                <TableCell>{schedule.sectionId}</TableCell>

                <TableCell
                  onDoubleClick={() => handleDoubleClick(schedule, "courseId")}
                >
                  {editingCell?.id === schedule.id &&
                  editingCell.field === "courseId" ? (
                    <select
                      value={editValue}
                      onChange={handleChange}
                      onBlur={() => {
                        setEditingCell(null)
                        setEditValue("")
                      }}
                      className="w-full rounded bg-background p-1 text-foreground"
                    >
                      <option value="">Select course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    (courses.find((c) => c.id === schedule.courseId)?.title ??
                    "—")
                  )}
                </TableCell>

                <TableCell
                  onDoubleClick={() => handleDoubleClick(schedule, "teacherId")}
                >
                  {editingCell?.id === schedule.id &&
                  editingCell.field === "teacherId" ? (
                    <select
                      value={editValue}
                      onChange={handleChange}
                      onBlur={() => {
                        setEditingCell(null)
                        setEditValue("")
                      }}
                      className="w-full rounded bg-background p-1 text-foreground"
                    >
                      <option value="">Select teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    (teachers.find((t) => t.id === schedule.teacherId)?.name ??
                    "—")
                  )}
                </TableCell>

                <TableCell
                  onDoubleClick={() => handleDoubleClick(schedule, "roomId")}
                >
                  {editingCell?.id === schedule.id &&
                  editingCell.field === "roomId" ? (
                    <select
                      value={editValue}
                      onChange={handleChange}
                      onBlur={() => {
                        setEditingCell(null)
                        setEditValue("")
                      }}
                      className="w-full rounded bg-background p-1 text-foreground"
                    >
                      <option value="">Select room</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    (rooms.find((r) => r.id === schedule.roomId)?.name ?? "—")
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default ClassScheduleTable
