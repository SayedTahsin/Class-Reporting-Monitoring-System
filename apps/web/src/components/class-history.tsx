import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { DatePicker } from "./ui/date-picker"

type AdminTabProps = {
  userRoleName: string
}
const ClassHistoryTable = ({ userRoleName }: AdminTabProps) => {
  const isSuperAdmin = userRoleName === "SuperAdmin"
  const isCR = userRoleName === "CR"
  const isTeacher = userRoleName === "Teacher"
  const canEdit = isSuperAdmin || isCR || isTeacher

  const [editingCell, setEditingCell] = useState<{
    slotId: string
    sectionId: string
  } | null>(null)

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const { data: teachers = [] } = useQuery(trpc.user.getTeachers.queryOptions())
  const { data: courses = [] } = useQuery(trpc.course.getAll.queryOptions())
  const { data: rooms = [] } = useQuery(trpc.room.getAll.queryOptions())
  const { data: sections = [] } = useQuery(trpc.section.getAll.queryOptions())
  const { data: slots = [] } = useQuery(trpc.slot.getAll.queryOptions())

  const { data: classHistory = [], refetch: refetchHistory } = useQuery({
    ...trpc.classHistory.getByDate.queryOptions({
      date: selectedDate
        ? Math.floor(selectedDate.getTime() / 1000).toString()
        : "",
    }),
    enabled: !!selectedDate && !Number.isNaN(selectedDate.getTime()),
  })

  const { mutate: updateClassHistoryStatus, isPending: isStatusUpdating } =
    useMutation(
      trpc.classHistory.update.mutationOptions({
        onSuccess: () => {
          toast.success("Status updated")
          setEditingCell(null)
          refetchHistory()
        },
        onError: (err) => toast.error(err.message),
      }),
    )

  const fetchClassHistoryByDate = (date: Date) => {
    const nDate = new Date(date)
    nDate.setHours(0, 0, 0, 0)
    setSelectedDate(nDate)
  }

  const getClassHistoryItem = (slotId: string, sectionId: string) => {
    return classHistory.find(
      (h) => h.slotId === slotId && h.sectionId === sectionId,
    )
  }

  return (
    <Card>
      <CardContent>
        <DatePicker
          date={selectedDate}
          onDateChange={fetchClassHistoryByDate}
        />
      </CardContent>
      <CardContent className="space-y-8">
        <div className="flex items-start">
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
                      const historyItem = getClassHistoryItem(
                        slot.id,
                        section.id,
                      )
                      const isEditing =
                        editingCell?.slotId === slot.id &&
                        editingCell?.sectionId === section.id

                      return (
                        <TableCell
                          key={section.id}
                          className={`border border-gray-300 px-4 py-2 ${
                            historyItem?.status === "delivered"
                              ? "bg-green-700"
                              : historyItem?.status === "notdelivered"
                                ? "bg-red-800"
                                : historyItem?.status === "rescheduled"
                                  ? "bg-yellow-700"
                                  : ""
                          }`}
                          onDoubleClick={() =>
                            historyItem &&
                            canEdit &&
                            setEditingCell({
                              slotId: slot.id,
                              sectionId: section.id,
                            })
                          }
                        >
                          {historyItem ? (
                            isEditing ? (
                              <div className="flex flex-col space-y-1">
                                <select
                                  value={historyItem.status}
                                  onChange={(e) =>
                                    updateClassHistoryStatus({
                                      id: historyItem.id,
                                      status: e.target.value as
                                        | "delivered"
                                        | "notdelivered"
                                        | "rescheduled",
                                      sectionId: section.id,
                                    })
                                  }
                                  className="w-full rounded bg-background p-1 text-sm"
                                >
                                  <option value="delivered">Delivered</option>
                                  <option value="notdelivered">
                                    Not Delivered
                                  </option>
                                  <option value="rescheduled">
                                    Rescheduled
                                  </option>
                                </select>
                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={() => setEditingCell(null)}
                                  disabled={isStatusUpdating}
                                >
                                  Close
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-1 whitespace-nowrap text-sm">
                                <div>
                                  Course:{" "}
                                  {courses.find(
                                    (c) => c.id === historyItem.courseId,
                                  )?.title || "-"}
                                </div>
                                <div>
                                  Teacher:{" "}
                                  {teachers.find(
                                    (t) => t.id === historyItem.teacherId,
                                  )?.name || "-"}
                                </div>
                                <div>
                                  Room:{" "}
                                  {rooms.find(
                                    (r) => r.id === historyItem.roomId,
                                  )?.name || "-"}
                                </div>
                              </div>
                            )
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              No data
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
      </CardContent>
    </Card>
  )
}

export default ClassHistoryTable
