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
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type Course = {
  id: string
  code: string
  title: string
  credits: number
}

const CourseForm = () => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      code: "",
      title: "",
      credits: 1,
    },
  })

  const { data: courses = [], refetch } = useQuery(
    trpc.course.getAll.queryOptions(),
  )

  const createCourse = useMutation(
    trpc.course.create.mutationOptions({
      onSuccess: () => {
        toast.success("Course created!")
        reset()
        refetch()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const updateCourse = useMutation(
    trpc.course.update.mutationOptions({
      onSuccess: () => {
        toast.success("Course updated!")
        refetch()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const deleteCourse = useMutation(
    trpc.course.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Course deleted.")
        refetch()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const [editingCell, setEditingCell] = useState<{
    id: string
    field: "code" | "title" | "credits"
  } | null>(null)

  const [editValue, setEditValue] = useState("")

  const onSubmit = handleSubmit((data) => {
    createCourse.mutate({
      code: data.code,
      title: data.title,
      credits: Number(data.credits),
    })
  })

  const handleDoubleClick = (
    course: Course,
    field: "code" | "title" | "credits",
  ) => {
    setEditingCell({ id: course.id, field })
    setEditValue(course[field]?.toString() ?? "")
  }

  const handleEditBlur = () => {
    if (editingCell && editValue.trim() !== "") {
      const payload = {
        id: editingCell.id,
        [editingCell.field]:
          editingCell.field === "credits" ? Number(editValue) : editValue,
      }
      updateCourse.mutate(payload)
    }
    setEditingCell(null)
    setEditValue("")
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="code">Course Code</Label>
              <Input id="code" {...register("code", { required: true })} />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title", { required: true })} />
            </div>
            <div>
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                {...register("credits", {
                  required: true,
                  valueAsNumber: true,
                  min: 1,
                })}
              />
            </div>
          </div>
          <Button type="submit">Create Course</Button>
        </form>

        <div>
          <Label className="mb-2">Existing Courses</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell
                    onDoubleClick={() => handleDoubleClick(course, "code")}
                    className="cursor-pointer"
                  >
                    {editingCell?.id === course.id &&
                    editingCell.field === "code" ? (
                      <Input
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditBlur}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur()
                        }}
                      />
                    ) : (
                      course.code
                    )}
                  </TableCell>
                  <TableCell
                    onDoubleClick={() => handleDoubleClick(course, "title")}
                    className="cursor-pointer"
                  >
                    {editingCell?.id === course.id &&
                    editingCell.field === "title" ? (
                      <Input
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditBlur}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur()
                        }}
                      />
                    ) : (
                      course.title
                    )}
                  </TableCell>
                  <TableCell
                    onDoubleClick={() => handleDoubleClick(course, "credits")}
                    className="cursor-pointer"
                  >
                    {editingCell?.id === course.id &&
                    editingCell.field === "credits" ? (
                      <Input
                        type="number"
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditBlur}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur()
                        }}
                      />
                    ) : (
                      course.credits
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCourse.mutate({ id: course.id })}
                    >
                      <Trash2 className=" text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseForm
