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

  const { data: courseResult = { data: [], total: 0, hasNext: false } } =
    useQuery({
      ...trpc.course.getAll.queryOptions(),
    })

  const { data: teachersResult = { data: [], total: 0, hasNext: false } } =
    useQuery({
      ...trpc.user.getTeachers.queryOptions(),
    })

  const teachers = teachersResult.data || []
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

  const { mutate: createSchedule, isPending: isCreating } = useMutation(
    trpc.classSchedule.create.mutationOptions({
      onSuccess: () => {
        toast.success("Schedule created!")
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
        <Label className="font-semibold text-xl">Weekly Routine</Label>

        {weekdays.map((day) => (
          <div key={day}>
            <div className="flex font-bold text-lg">{day.toUpperCase()}</div>
            <div className="flex-1 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap border border-gray-300 px-3 py-2">
                      Slot / Section
                    </TableHead>
                    {sections.map(({ id, name }) => (
                      <TableHead
                        key={id}
                        className="whitespace-nowrap border border-gray-300 px-3 py-2"
                      >
                        {name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {slots.map(({ id: slotId, startTime, endTime }) => (
                    <TableRow key={slotId}>
                      <TableCell className="whitespace-nowrap border border-gray-300 px-3 py-2 font-medium">
                        {startTime} - {endTime}
                      </TableCell>

                      {sections.map(({ id: sectionId }) => {
                        const item = getScheduleItem(day, slotId, sectionId)
                        const isEditing =
                          editingCell?.day === day &&
                          editingCell.slotId === slotId &&
                          editingCell.sectionId === sectionId

                        return (
                          <TableCell
                            key={sectionId}
                            className="cursor-pointer border border-gray-300 px-3 py-2"
                            onDoubleClick={() =>
                              handleEditStart(day, slotId, sectionId)
                            }
                            title={item ? undefined : "Double click to add"}
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
                                  className="w-full rounded border border-input bg-background p-1 text-sm"
                                >
                                  <option value="">Select course</option>
                                  {courses.map(({ id, title }) => (
                                    <option key={id} value={id}>
                                      {title}
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
                                  className="w-full rounded border border-input bg-background p-1 text-sm"
                                >
                                  <option value="">Select teacher</option>
                                  {teachers?.map(({ id, name }) => (
                                    <option key={id} value={id}>
                                      {name}
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
                                  className="w-full rounded border border-input bg-background p-1 text-sm"
                                >
                                  <option value="">Select room</option>
                                  {rooms.map(({ id, name }) => (
                                    <option key={id} value={id}>
                                      {name}
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
                              <div className="space-y-0.5 whitespace-nowrap text-sm">
                                <div>
                                  {courses.find((c) => c.id === item.courseId)
                                    ?.title ?? "-"}
                                </div>
                                <div>
                                  {teachers.find((t) => t.id === item.teacherId)
                                    ?.name ?? "-"}
                                </div>
                                <div>
                                  {rooms.find((r) => r.id === item.roomId)
                                    ?.name ?? "-"}
                                </div>
                              </div>
                            ) : (
                              <span className="select-none text-muted-foreground text-xs">
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
