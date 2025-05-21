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
import { useForm } from "react-hook-form"
import { toast } from "sonner"

const weekdays = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
]

type WeekDay =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"

const ClassScheduleTable = () => {
  const [editingCell, setEditingCell] = useState<{
    day: string
    slotId: string
    sectionId: string
  } | null>(null)

  const [editFormData, setEditFormData] = useState<{
    courseId: string
    teacherId: string
    roomId: string
  }>({ courseId: "", teacherId: "", roomId: "" })

  const [isNewSchedule, SetIsNewSchedule] = useState<boolean>(false)

  const { data: teachers = [] } = useQuery(trpc.user.getTeachers.queryOptions())
  const { data: courses = [] } = useQuery(trpc.course.getAll.queryOptions())
  const { data: rooms = [] } = useQuery(trpc.room.getAll.queryOptions())
  const { data: sections = [] } = useQuery(trpc.section.getAll.queryOptions())
  const { data: slots = [] } = useQuery(trpc.slot.getAll.queryOptions())
  const { data: schedules = [], refetch } = useQuery(
    trpc.classSchedule.getAll.queryOptions(),
  )

  const { mutate: createSchedule, isPending: isCreating } = useMutation(
    trpc.classSchedule.create.mutationOptions({
      onSuccess: () => {
        toast.success("Schedule created!")
        reset()
        refetch()
        setEditingCell(null)
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const { mutate: updateSchedule, isPending: isUpdating } = useMutation(
    trpc.classSchedule.update.mutationOptions({
      onSuccess: () => {
        toast.success("Schedule updated!")
        setEditingCell(null)
        refetch()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      slotId: "",
      teacherId: "",
      roomId: "",
      sectionId: "",
      courseId: "",
      day: "",
    },
  })

  const onSubmit = handleSubmit((data) => {
    createSchedule({
      ...data,
      day: data.day.toLowerCase() as WeekDay,
    })
  })

  const getScheduleItem = (day: string, slotId: string, sectionId: string) => {
    return schedules.find(
      (s) =>
        s.day.toLowerCase() === day.toLowerCase() &&
        s.slotId === slotId &&
        s.sectionId === sectionId,
    )
  }

  const handleEditStart = (day: string, slotId: string, sectionId: string) => {
    const item = getScheduleItem(day, slotId, sectionId)

    if (!item) SetIsNewSchedule(true)

    setEditingCell({ day, slotId, sectionId })
    setEditFormData({
      courseId: item?.courseId || "",
      teacherId: item?.teacherId || "",
      roomId: item?.roomId || "",
    })
  }

  const handleCellUpdate = () => {
    if (!editingCell) return
    const { day, slotId, sectionId } = editingCell
    if (isNewSchedule) {
      createSchedule({
        day: day.toLowerCase() as WeekDay,
        slotId,
        sectionId,
        courseId: editFormData.courseId,
        teacherId: editFormData.teacherId,
        roomId: editFormData.roomId,
      })
    } else {
      updateSchedule({
        day: day.toLowerCase() as WeekDay,
        slotId,
        sectionId,
        courseId: editFormData.courseId,
        teacherId: editFormData.teacherId,
        roomId: editFormData.roomId,
      })
    }
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="day">Day</Label>
              <select
                id="day"
                {...register("day", { required: true })}
                className="w-full rounded bg-background p-1 text-foreground"
              >
                <option value="">Select day</option>
                {weekdays.map((day) => (
                  <option key={day} value={day.toLowerCase()}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="slotId">Slot</Label>
              <select
                id="slotId"
                {...register("slotId", { required: true })}
                className="w-full rounded bg-background p-1 text-foreground"
              >
                <option value="">Select slot</option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.startTime} - {slot.endTime}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="roomId">Room</Label>
              <select
                id="roomId"
                {...register("roomId", { required: true })}
                className="w-full rounded bg-background p-1 text-foreground"
              >
                <option value="">Select room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="teacherId">Teacher</Label>
              <select
                id="teacherId"
                {...register("teacherId", { required: true })}
                className="w-full rounded bg-background p-1 text-foreground"
              >
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="sectionId">Section</Label>
              <select
                id="sectionId"
                {...register("sectionId", { required: true })}
                className="w-full rounded bg-background p-1 text-foreground"
              >
                <option value="">Select section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="courseId">Course</Label>
              <select
                id="courseId"
                {...register("courseId", { required: true })}
                className="w-full rounded bg-background p-1 text-foreground"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit">Create Schedule</Button>
        </form>
      </CardContent>

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
                        const isEditing =
                          editingCell &&
                          editingCell.day === day &&
                          editingCell.slotId === slot.id &&
                          editingCell.sectionId === section.id

                        return (
                          <TableCell
                            key={section.id}
                            className="border border-gray-300 px-4 py-2"
                            onDoubleClick={() =>
                              handleEditStart(day, slot.id, section.id)
                            }
                          >
                            {isEditing ? (
                              <div className="flex flex-col space-y-1">
                                <select
                                  value={editFormData.courseId}
                                  onChange={(e) =>
                                    setEditFormData((prev) => ({
                                      ...prev,
                                      courseId: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded bg-background p-1 text-sm"
                                >
                                  <option value="">Select course</option>
                                  {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                      {course.title}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={editFormData.teacherId}
                                  onChange={(e) =>
                                    setEditFormData((prev) => ({
                                      ...prev,
                                      teacherId: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded bg-background p-1 text-sm"
                                >
                                  <option value="">Select teacher</option>
                                  {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                      {teacher.name}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={editFormData.roomId}
                                  onChange={(e) =>
                                    setEditFormData((prev) => ({
                                      ...prev,
                                      roomId: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded bg-background p-1 text-sm"
                                >
                                  <option value="">Select room</option>
                                  {rooms.map((room) => (
                                    <option key={room.id} value={room.id}>
                                      {room.name}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  size="sm"
                                  className="mt-1 w-full"
                                  onClick={handleCellUpdate}
                                  disabled={isCreating || isUpdating}
                                >
                                  Save
                                </Button>
                              </div>
                            ) : item ? (
                              <div className="space-y-1 whitespace-nowrap text-sm">
                                <div>
                                  {courses.find((c) => c.id === item.courseId)
                                    ?.title || "-"}
                                </div>
                                <div>
                                  {teachers.find((t) => t.id === item.teacherId)
                                    ?.name || "-"}
                                </div>
                                <div>
                                  {rooms.find((r) => r.id === item.roomId)
                                    ?.name || "-"}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                Double click to add
                              </span>
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

export default ClassScheduleTable
