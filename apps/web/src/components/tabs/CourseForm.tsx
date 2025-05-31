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
import { useDebounce } from "@uidotdev/usehooks"
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
type AdminTabProps = {
  userRoleName: string
}

const PAGE_LIMIT = 10

const CourseForm = ({ userRoleName }: AdminTabProps) => {
  const isSuperAdmin = userRoleName === "SuperAdmin"
  const isChairman = userRoleName === "Chairman"

  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [creditFilter, setCreditFilter] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      code: "",
      title: "",
      credits: 1,
    },
  })

  const queryInput = {
    page,
    limit: PAGE_LIMIT,
  }

  const getCoursesQuery = () => {
    if (debouncedSearchTerm && creditFilter !== null) {
      return trpc.course.searchByCredits.queryOptions({
        q: debouncedSearchTerm,
        credits: creditFilter,
        ...queryInput,
      })
    }
    if (debouncedSearchTerm) {
      return trpc.course.search.queryOptions({
        q: debouncedSearchTerm,
        ...queryInput,
      })
    }
    if (creditFilter !== null) {
      return trpc.course.filterByCredits.queryOptions({
        credits: creditFilter,
        ...queryInput,
      })
    }
    return trpc.course.getAll.queryOptions(queryInput)
  }

  const { data: courses = [], refetch } = useQuery({
    ...getCoursesQuery(),
  })

  const createCourse = useMutation(
    trpc.course.create.mutationOptions({
      onSuccess: () => {
        toast.success("Course created!")
        reset()
        setPage(1)
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
    if (!isChairman && !isSuperAdmin) return

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

  const handleCreditFilterChange = (value: string) => {
    if (value === "") {
      setCreditFilter(null)
      setPage(1)
    } else {
      setCreditFilter(Number(value))
      setPage(1)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1)
  }
  const handleNextPage = () => {
    if (courses.length === PAGE_LIMIT) setPage(page + 1)
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        {(isChairman || isSuperAdmin) && (
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
        )}

        <div className="mb-4 flex items-center space-x-4">
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-full flex-grow basis-4/5"
          />

          <select
            value={creditFilter !== null ? creditFilter.toString() : ""}
            onChange={(e) => handleCreditFilterChange(e.target.value)}
            className="flex-grow basis-1/5 rounded bg-background p-1 text-foreground"
          >
            <option value="">All Credits</option>
            <option value="1">1 Credit</option>
            <option value="2">2 Credits</option>
            <option value="3">3 Credits</option>
            <option value="4">4 Credits</option>
          </select>
        </div>

        <div>
          <Label className="mb-2">Existing Courses</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Credits</TableHead>
                {isSuperAdmin && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
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
                        min={1}
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

                  {isSuperAdmin && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCourse.mutate({ id: course.id })}
                      >
                        <Trash2 className=" text-red-500" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {courses.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isSuperAdmin ? 4 : 3}
                    className="text-center"
                  >
                    No courses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-between">
          <Button disabled={page === 1} onClick={handlePreviousPage}>
            Previous
          </Button>
          <div className="flex items-center space-x-2">
            <span>Page</span>
            <Input
              type="number"
              min={1}
              value={page}
              onChange={(e) => {
                const val = Number(e.target.value)
                if (val > 0) setPage(val)
              }}
              className="w-12 p-0 text-center"
            />
          </div>
          <Button
            disabled={courses.length < PAGE_LIMIT}
            onClick={handleNextPage}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseForm
