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

type Room = {
  id: string
  name: string
  description: string | null
}

const RoomForm = () => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const { data: rooms = [], refetch } = useQuery(
    trpc.room.getAll.queryOptions(),
  )

  const createRoom = useMutation(
    trpc.room.create.mutationOptions({
      onSuccess: () => {
        toast.success("Room created successfully!")
        reset()
        refetch()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const updateRoom = useMutation(
    trpc.room.update.mutationOptions({
      onSuccess: () => {
        toast.success("Room updated!")
        refetch()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const [editingCell, setEditingCell] = useState<{
    id: string
    field: "name" | "description"
  } | null>(null)
  const [editValue, setEditValue] = useState("")

  const onSubmit = handleSubmit((data) => {
    console.log(data)
    createRoom.mutate(data)
  })

  const handleDoubleClick = (room: Room, field: "name" | "description") => {
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

  return (
    <Card>
      <CardContent className="space-y-6 py-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Room Name</Label>
              <Input id="name" {...register("name", { required: true })} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register("description")} />
            </div>
          </div>
          <Button type="submit">Create Room</Button>
        </form>

        <div>
          <Label className="mb-2 block">Existing Rooms</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur()
                        }}
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur()
                        }}
                      />
                    ) : (
                      (room.description ?? "-")
                    )}
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

export default RoomForm
