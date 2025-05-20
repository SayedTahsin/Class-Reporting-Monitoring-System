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

const SlotForm = () => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      slotNumber: 1,
      startTime: "",
      endTime: "",
    },
  })

  const { data: slots, refetch } = useQuery(trpc.slot.getAll.queryOptions())

  const createSlot = useMutation(
    trpc.slot.create.mutationOptions({
      onSuccess: () => {
        toast.success("Slot created")
        refetch()
        reset()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const updateSlot = useMutation(
    trpc.slot.update.mutationOptions({
      onSuccess: () => {
        toast.success("Slot updated")
        refetch()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const deleteSlot = useMutation(
    trpc.slot.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Slot deleted")
        refetch()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const [editing, setEditing] = useState<{
    id: string
    field: "slotNumber" | "startTime" | "endTime"
  } | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleEdit = (
    id: string,
    field: "slotNumber" | "startTime" | "endTime",
    value: string | number,
  ) => {
    setEditing({ id, field })
    setEditValue(String(value))
  }

  const handleEditSubmit = () => {
    if (editing) {
      const value =
        editing.field === "slotNumber" ? Number(editValue) : editValue
      updateSlot.mutate({ id: editing.id, [editing.field]: value })
      setEditing(null)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this slot?")) {
      deleteSlot.mutate({ id })
    }
  }

  const onSubmit = handleSubmit((data) => {
    createSlot.mutate({
      slotNumber: Number(data.slotNumber),
      startTime: data.startTime,
      endTime: data.endTime,
    })
  })

  return (
    <Card>
      <CardContent className="space-y-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="slotNumber">Slot Number</Label>
              <Input
                id="slotNumber"
                type="number"
                {...register("slotNumber", {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                {...register("startTime", { required: true })}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                {...register("endTime", { required: true })}
              />
            </div>
          </div>
          <Button type="submit">Create Slot</Button>
        </form>

        <div>
          <Label>Existing Slots</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot #</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots?.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell
                    onDoubleClick={() =>
                      handleEdit(slot.id, "slotNumber", slot.slotNumber || "")
                    }
                  >
                    {editing?.id === slot.id &&
                    editing.field === "slotNumber" ? (
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditSubmit}
                      />
                    ) : (
                      slot.slotNumber
                    )}
                  </TableCell>

                  <TableCell
                    onDoubleClick={() =>
                      handleEdit(slot.id, "startTime", slot.startTime)
                    }
                  >
                    {editing?.id === slot.id &&
                    editing.field === "startTime" ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditSubmit}
                      />
                    ) : (
                      slot.startTime
                    )}
                  </TableCell>

                  <TableCell
                    onDoubleClick={() =>
                      handleEdit(slot.id, "endTime", slot.endTime)
                    }
                  >
                    {editing?.id === slot.id && editing.field === "endTime" ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditSubmit}
                      />
                    ) : (
                      slot.endTime
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

export default SlotForm
