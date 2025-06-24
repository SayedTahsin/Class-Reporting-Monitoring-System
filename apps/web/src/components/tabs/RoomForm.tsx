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
import { handleErrorMsg } from "@/utils/error-msg"
import { trpc } from "@/utils/trpc"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useDebounce } from "@uidotdev/usehooks"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type Room = {
  id: string
  name: string
  description: string | null
}
type AdminTabProps = {
  userRoleName: string
}

const PAGE_LIMIT = 10

const RoomForm = ({ userRoleName }: AdminTabProps) => {
  const isSuperAdmin = userRoleName === "SuperAdmin"
  const isChairman = userRoleName === "Chairman"

  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [page, setPage] = useState(1)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const queryInput = {
    page,
    limit: PAGE_LIMIT,
  }

  const getCoursesQuery = () => {
    if (debouncedSearchTerm) {
      return trpc.room.search.queryOptions({
        q: debouncedSearchTerm,
        ...queryInput,
      })
    }
    return trpc.room.getAll.queryOptions(queryInput)
  }

  const {
    data: result = { data: [], total: 0, hasNext: false },
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    ...getCoursesQuery(),
  })
  const rooms = result.data || []
  const hasNext = result.hasNext || false

  const createRoom = useMutation(
    trpc.room.create.mutationOptions({
      onSuccess: () => {
        toast.success("Room created successfully!")
        reset()
        refetch()
      },
      onError: (err) => toast.error(handleErrorMsg(err)),
    }),
  )

  const updateRoom = useMutation(
    trpc.room.update.mutationOptions({
      onSuccess: () => {
        toast.success("Room updated!")
        refetch()
      },
      onError: (err) => toast.error(handleErrorMsg(err)),
    }),
  )

  const deleteRoom = useMutation(
    trpc.room.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Room deleted!")
        refetch()
      },
      onError: (err) => toast.error(handleErrorMsg(err)),
    }),
  )

  const [editingCell, setEditingCell] = useState<{
    id: string
    field: "name" | "description"
  } | null>(null)
  const [editValue, setEditValue] = useState("")

  const onSubmit = handleSubmit((data) => {
    createRoom.mutate(data)
  })

  const handleDoubleClick = (room: Room, field: "name" | "description") => {
    if (!isChairman && !isSuperAdmin) return

    setEditingCell({ id: room.id, field })
    setEditValue(room[field] ?? "")
  }

  const handleEditBlur = () => {
    if (editingCell && editValue.trim() !== "") {
      updateRoom.mutate({ id: editingCell.id, [editingCell.field]: editValue })
    }
    setEditingCell(null)
    setEditValue("")
  }

  const handleDelete = (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room?",
    )
    if (confirmDelete) {
      deleteRoom.mutate({ id })
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
    if (hasNext) setPage(page + 1)
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        {(isChairman || isSuperAdmin) && (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Room Name</Label>
                <Input id="name" {...register("name", { required: true })} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...register("description")} />
              </div>
            </div>
            <Button type="submit" className="w-full sm:w-fit">
              Create Room
            </Button>
          </form>
        )}

        <Input
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full"
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              {isSuperAdmin && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell
                  onDoubleClick={() => handleDoubleClick(room, "name")}
                  className="cursor-pointer"
                >
                  {editingCell?.id === room.id &&
                  editingCell.field === "name" ? (
                    <Input
                      value={editValue}
                      autoFocus
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleEditBlur}
                      onKeyDown={(e) =>
                        e.key === "Enter" && e.currentTarget.blur()
                      }
                    />
                  ) : (
                    room.name
                  )}
                </TableCell>

                <TableCell
                  onDoubleClick={() => handleDoubleClick(room, "description")}
                  className="cursor-pointer"
                >
                  {editingCell?.id === room.id &&
                  editingCell.field === "description" ? (
                    <Input
                      value={editValue}
                      autoFocus
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleEditBlur}
                      onKeyDown={(e) =>
                        e.key === "Enter" && e.currentTarget.blur()
                      }
                    />
                  ) : (
                    room.description || "-"
                  )}
                </TableCell>

                {isSuperAdmin && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(room.id)}
                    >
                      <Trash2 className="text-red-500" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={handlePreviousPage}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <span>Page</span>
            <Input
              type="number"
              min={1}
              value={page}
              onChange={(e) => {
                const val = Number(e.target.value)
                if (val > 0) setPage(val)
              }}
              className="w-14 text-center"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={rooms.length === 0 || !hasNext}
            onClick={handleNextPage}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default RoomForm
