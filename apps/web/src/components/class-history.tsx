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
import type { DateRange } from "react-day-picker"
import { toast } from "sonner"
import { DatePickerWithRange } from "./ui/date-picker-range"

type OverviewType = "section" | "teacher" | "room"

type AdminTabProps = {
  userRoleName: string
}

const ClassHistoryTable = ({ userRoleName }: AdminTabProps) => {
  const isSuperAdmin = userRoleName === "SuperAdmin"
  const isCR = userRoleName === "CR"
  const isTeacher = userRoleName === "Teacher"
  const canEdit = isSuperAdmin || isCR || isTeacher

  const [overview, setOverview] = useState<OverviewType>("section")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const today = new Date()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: today,
    to: today,
  })
  const [editingCell, setEditingCell] = useState<{
    slotId: string
    sectionId: string
  } | null>(null)

  const from = dateRange?.from
    ? Math.floor(
        new Date(dateRange.from).setHours(0, 0, 0, 0) / 1000,
      ).toString()
    : undefined
  const to = dateRange?.to
    ? Math.floor(
        new Date(dateRange.to).setHours(23, 59, 59, 999) / 1000,
      ).toString()
    : undefined

  const { data: teachersResult = { data: [] } } = useQuery(
    trpc.user.getTeachers.queryOptions(),
  )
  const { data: coursesResult = { data: [] } } = useQuery(
    trpc.course.getAll.queryOptions(),
  )
  const { data: roomsResult = { data: [] } } = useQuery(
    trpc.room.getAll.queryOptions(),
  )
  const { data: sections = [] } = useQuery(trpc.section.getAll.queryOptions())
  const { data: slots = [] } = useQuery(trpc.slot.getAll.queryOptions())

  const teachers = teachersResult.data
  const courses = coursesResult.data
  const rooms = roomsResult.data

  const {
    data: classHistory = [],
    isLoading,
    isError,
    refetch: refetchHistory,
  } = useQuery({
    ...trpc.classHistory.getByDate.queryOptions({ from, to }),
    enabled: !!from && !!to,
  })

  const filteredHistory = selectedId
    ? classHistory.filter((item) => {
        if (overview === "section") return item.sectionId === selectedId
        if (overview === "teacher") return item.teacherId === selectedId
        if (overview === "room") return item.roomId === selectedId
        return true
      })
    : classHistory

  const cellMap: Record<
    string,
    Array<{
      id: string
      slotId: string
      courseId: string
      teacherId: string
      sectionId: string
      roomId: string
      status: "delivered" | "notdelivered" | "rescheduled"
    }>
  > = {}

  for (const item of filteredHistory) {
    const date = item.date.split("T")[0]
    if (!cellMap[date]) cellMap[date] = []
    cellMap[date].push({
      id: item.id,
      slotId: item.slotId,
      courseId: item.courseId,
      teacherId: item.teacherId,
      sectionId: item.sectionId,
      roomId: item.roomId,
      status: item.status,
    })
  }

  const getName = (
    list: { id: string; name?: string; code?: string; title?: string }[],
    id?: string,
  ) =>
    list.find((x) => x.id === id)?.name ??
    list.find((x) => x.id === id)?.code ??
    list.find((x) => x.id === id)?.title ??
    ""

  const overviewList =
    overview === "section"
      ? sections
      : overview === "teacher"
        ? teachers
        : rooms

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

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          <div className="flex items-end gap-2">
            <label htmlFor="overview-select" className="font-medium">
              Overview of:
            </label>
            <select
              id="overview-select"
              value={overview}
              onChange={(e) => {
                setOverview(e.target.value as OverviewType)
                setSelectedId(null)
              }}
              className="rounded bg-background p-1 text-sm"
            >
              <option value="section">Section</option>
              <option value="teacher">Teacher</option>
              <option value="room">Room</option>
            </select>

            <select
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded bg-background p-1 text-sm"
            >
              <option value="">All</option>
              {overviewList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name ?? item.title ?? "Unnamed"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="border px-4 py-2">Date/Slot</TableHead>
                  {slots.map((slot) => (
                    <TableHead
                      key={slot.id}
                      className="whitespace-nowrap border px-4 py-2"
                    >
                      {slot.startTime} - {slot.endTime}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              {isLoading ? (
                <div className="text-center text-muted-foreground text-sm">
                  Loading...
                </div>
              ) : isError ? (
                <div className="text-center text-red-500 text-sm">
                  Failed to load data.
                </div>
              ) : (
                <TableBody>
                  {Object.entries(cellMap).length === 0 && (
                    <div className="text-center text-muted-foreground text-sm">
                      No Data
                    </div>
                  )}
                  {Object.entries(cellMap).map(([date, entries]) => (
                    <TableRow key={date}>
                      <TableCell className="border px-4 py-2 font-medium">
                        {date}
                      </TableCell>
                      {slots.map((slot) => {
                        const entry = entries.find((e) => e.slotId === slot.id)
                        if (!entry) {
                          return (
                            <TableCell
                              key={slot.id}
                              className="border px-4 py-2 text-muted-foreground"
                            >
                              -
                            </TableCell>
                          )
                        }

                        const course = getName(courses, entry.courseId)
                        const teacher = getName(teachers, entry.teacherId)
                        const section = getName(sections, entry.sectionId)
                        const room = getName(rooms, entry.roomId)

                        const statusBg: Record<typeof entry.status, string> = {
                          delivered: "bg-green-700",
                          rescheduled: "bg-yellow-700",
                          notdelivered: "bg-red-700",
                        }
                        const isEditing =
                          editingCell?.slotId === slot.id &&
                          editingCell?.sectionId === entry.sectionId
                        return (
                          <TableCell
                            key={slot.id}
                            className={`space-y-1 border px-4 py-2 text-sm ${statusBg[entry.status]}`}
                            onDoubleClick={() =>
                              canEdit &&
                              setEditingCell({
                                slotId: slot.id,
                                sectionId: entry.sectionId,
                              })
                            }
                          >
                            {isEditing ? (
                              <div className="flex flex-col space-y-1">
                                <select
                                  value={entry.status}
                                  onChange={(e) =>
                                    updateClassHistoryStatus({
                                      id: entry.id,
                                      status: e.target.value as
                                        | "delivered"
                                        | "notdelivered"
                                        | "rescheduled",
                                      sectionId: entry.sectionId,
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
                              <div>
                                <div>{course}</div>
                                <div>{teacher}</div>
                                <div>{section}</div>
                                <div>{room}</div>
                              </div>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              )}{" "}
            </Table>
          </div>
        }
      </CardContent>
    </Card>
  )
}

export default ClassHistoryTable
