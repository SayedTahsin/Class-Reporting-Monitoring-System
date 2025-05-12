import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

type classSchedule = {
  date: Date
  batchId: string
  slotId: number
  teacherId: string
  courseId: string
  roomId: string
  status?: "delivered" | "notdelivered" | "rescheduled" | undefined
}

const ClassScheduleForm = () => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      slotId: 0,
      batchId: "",
      courseId: "",
      teacherId: "",
      roomId: "",
      status: "notdelivered",
    },
  })

  const { data: slots } = useQuery(trpc.slot.getAll.queryOptions())
  const { data: batches } = useQuery(trpc.batch.getAll.queryOptions())
  const { data: courses } = useQuery(trpc.course.getAll.queryOptions())
  const { data: rooms } = useQuery(trpc.room.getAll.queryOptions())
  const { data: teachers } = useQuery(trpc.user.getTeachers.queryOptions())

  const [filterDate, setFilterDate] = useState("")
  const [filterTeacher, setFilterTeacher] = useState("")
  const [filteredClasses, setFilteredClasses] = useState<classSchedule[]>([])

  const createClass = useMutation(
    trpc.classSchedule.create.mutationOptions({
      onSuccess: () => {
        toast.success("Class created successfully!")
        reset()
        handleFilter()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const updateClass = useMutation(
    trpc.classSchedule.update.mutationOptions({
      onSuccess: () => {
        toast.success("Class updated!")
        handleFilter()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const onSubmit = handleSubmit((data) => {
    createClass.mutate({
      ...data,
      slotId: Number(data.slotId),
      date: new Date(data.date),
      status: data.status as "notdelivered" | "delivered" | "rescheduled",
    })
  })

  const getByTeacherId = useMutation(
    trpc.classSchedule.getByTeacherId.mutationOptions(),
  )
  const getByDate = useMutation(trpc.classSchedule.getByDate.mutationOptions())

  const handleFilter = async () => {
    if (filterTeacher) {
      const data = await getByTeacherId.mutateAsync({
        teacherId: filterTeacher,
      })
      const parsed = data.map((cls) => ({
        ...cls,
        date: new Date(cls.date),
      }))
      setFilteredClasses(parsed)
    } else if (filterDate) {
      const data = await getByDate.mutateAsync({ date: new Date(filterDate) })
      const parsed = data.map((cls) => ({
        ...cls,
        date: new Date(cls.date),
      }))
      setFilteredClasses(parsed)
    } else {
      setFilteredClasses([])
    }
  }

  const updateField = (
    date: Date,
    slotId: number,
    field: "status" | "batchId" | "courseId" | "roomId" | "teacherId",
    value: string,
  ) => {
    updateClass.mutate({ date, slotId, [field]: value })
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register("date", { required: true })}
              />
            </div>
            <div>
              <Label htmlFor="slot">Slot</Label>
              <select
                id="slot"
                {...register("slotId", { required: true })}
                className="w-full rounded bg-background p-1 text-foreground"
              >
                <option value="">Select Slot</option>
                {slots?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.slotNumber} ({u.startTime} - {u.endTime})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="batch">Batch</Label>
              <select
                id="batch"
                {...register("batchId", { required: true })}
                className="w-full rounded bg-background p-1 text-foreground"
              >
                <option value="">Select Batch</option>
                {batches?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="course">Course</Label>
              <select
                id="course"
                {...register("courseId", { required: true })}
                className="w-full rounded bg-background p-1 text-foreground"
              >
                <option value="">Select Course</option>
                {courses?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.code} - {u.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="teacher">Teacher</Label>
              <select
                id="teacher"
                {...register("teacherId", { required: true })}
                className="w-full rounded bg-background p-1 text-foreground"
              >
                <option value="">Select Teacher</option>
                {teachers?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} - {u.username}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="room">Room</Label>
              <select
                id="room"
                {...register("roomId", { required: true })}
                className="w-full rounded bg-background p-1 text-foreground"
              >
                <option value="">Select Room</option>
                {rooms?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit">Create Class</Button>
        </form>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="filterDate">Filter by Date</Label>
            <Input
              id="filterDate"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="filterTeacher">Filter by Teacher</Label>
            <select
              id="filterTeacher"
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="w-full rounded bg-background p-1 text-foreground"
            >
              <option value="">All Teachers</option>
              {teachers?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} - {u.username}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button onClick={handleFilter}>Apply Filter</Button>

        {filteredClasses.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Teacher</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => (
                <TableRow key={`${cls.slotId}_${cls.date.toISOString()}`}>
                  <TableCell>{cls.date.toISOString().split("T")[0]}</TableCell>
                  <TableCell>
                    <select
                      value={cls.status}
                      onChange={(e) =>
                        updateField(
                          cls.date,
                          cls.slotId,
                          "status",
                          e.target.value,
                        )
                      }
                    >
                      <option value="notdelivered">Not Delivered</option>
                      <option value="delivered">Delivered</option>
                      <option value="rescheduled">Rescheduled</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      value={cls.batchId}
                      onChange={(e) =>
                        updateField(
                          cls.date,
                          cls.slotId,
                          "batchId",
                          e.target.value,
                        )
                      }
                    >
                      {batches?.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      value={cls.courseId}
                      onChange={(e) =>
                        updateField(
                          cls.date,
                          cls.slotId,
                          "courseId",
                          e.target.value,
                        )
                      }
                    >
                      {courses?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.title}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      value={cls.roomId}
                      onChange={(e) =>
                        updateField(
                          cls.date,
                          cls.slotId,
                          "roomId",
                          e.target.value,
                        )
                      }
                    >
                      {rooms?.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      value={cls.teacherId}
                      onChange={(e) =>
                        updateField(
                          cls.date,
                          cls.slotId,
                          "teacherId",
                          e.target.value,
                        )
                      }
                    >
                      {teachers?.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default ClassScheduleForm
