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
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
type AdminTabProps = {
  userRoleName: string
}
const SlotForm = ({ userRoleName }: AdminTabProps) => {
  const isChairman = userRoleName === "Chairman"
  const isSuperAdmin = userRoleName === "SuperAdmin"
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
      onError: (err) => toast.error(handleErrorMsg(err)),
    }),
  )

  const updateSlot = useMutation(
    trpc.slot.update.mutationOptions({
      onSuccess: () => {
        toast.success("Slot updated")
        refetch()
      },
      onError: (err) => toast.error(handleErrorMsg(err)),
    }),
  )

  const deleteSlot = useMutation(
    trpc.slot.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Slot deleted")
        refetch()
      },
      onError: (err) => toast.error(handleErrorMsg(err)),
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
    if (!isChairman && !isSuperAdmin) return
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

  const onSubmit = handleSubmit((data) => {
    createSlot.mutate({
      slotNumber: Number(data.slotNumber),
      startTime: data.startTime,
      endTime: data.endTime,
    })
  })

  return (
    <Card>
      <CardContent className="space-y-4">
        {(isChairman || isSuperAdmin) && (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
            <Button type="submit" className="w-full sm:w-fit">
              Create Slot
            </Button>
          </form>
        )}

        <div className="space-y-2">
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
                    className="cursor-pointer"
                  >
                    {editing?.id === slot.id &&
                    editing.field === "slotNumber" ? (
                      <Input
                        type="number"
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditSubmit}
                        onKeyDown={(e) =>
                          e.key === "Enter" && e.currentTarget.blur()
                        }
                      />
                    ) : (
                      slot.slotNumber
                    )}
                  </TableCell>

                  <TableCell
                    onDoubleClick={() =>
                      handleEdit(slot.id, "startTime", slot.startTime)
                    }
                    className="cursor-pointer"
                  >
                    {editing?.id === slot.id &&
                    editing.field === "startTime" ? (
                      <Input
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditSubmit}
                        onKeyDown={(e) =>
                          e.key === "Enter" && e.currentTarget.blur()
                        }
                      />
                    ) : (
                      slot.startTime
                    )}
                  </TableCell>

                  <TableCell
                    onDoubleClick={() =>
                      handleEdit(slot.id, "endTime", slot.endTime)
                    }
                    className="cursor-pointer"
                  >
                    {editing?.id === slot.id && editing.field === "endTime" ? (
                      <Input
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditSubmit}
                        onKeyDown={(e) =>
                          e.key === "Enter" && e.currentTarget.blur()
                        }
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
