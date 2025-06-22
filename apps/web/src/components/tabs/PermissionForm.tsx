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

type Permission = {
  id: string
  name: string
  description: string | null
}

const PermissionForm = () => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const { data: permissions = [], refetch } = useQuery(
    trpc.permission.getAll.queryOptions()
  )

  const createPermission = useMutation(
    trpc.permission.create.mutationOptions({
      onSuccess: () => {
        toast.success("Permission created")
        reset()
        refetch()
      },
      onError: (err) => toast.error(err.message),
    })
  )

  const updatePermission = useMutation(
    trpc.permission.update.mutationOptions({
      onSuccess: () => {
        toast.success("Permission updated")
        refetch()
      },
      onError: (err) => toast.error(err.message),
    })
  )

  const deletePermission = useMutation(
    trpc.permission.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Permission deleted")
        refetch()
      },
      onError: (err) => toast.error(err.message),
    })
  )

  const [editingCell, setEditingCell] = useState<{
    id: string
    field: "name" | "description"
  } | null>(null)

  const [editValue, setEditValue] = useState("")

  const onSubmit = handleSubmit((data) => {
    createPermission.mutate({
      name: data.name,
      description: data.description || undefined,
    })
  })

  const handleDoubleClick = (
    perm: Permission,
    field: "name" | "description"
  ) => {
    setEditingCell({ id: perm.id, field })
    setEditValue(perm[field] ?? "") // Normalize null to ""
  }

  const handleEditBlur = () => {
    if (editingCell && editValue.trim() !== "") {
      const payload = {
        id: editingCell.id,
        [editingCell.field]: editValue,
      }
      updatePermission.mutate(payload)
    }
    setEditingCell(null)
    setEditValue("")
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Permission Name</Label>
              <Input id="name" {...register("name", { required: true })} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register("description")} />
            </div>
          </div>
          <Button type="submit" className="w-full sm:w-fit">
            Create Permission
          </Button>
        </form>

        <div className="space-y-2">
          <Label className="text-base">Existing Permissions</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((perm: Permission) => (
                <TableRow key={perm.id}>
                  <TableCell
                    onDoubleClick={() => handleDoubleClick(perm, "name")}
                    className="cursor-pointer"
                  >
                    {editingCell?.id === perm.id &&
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
                      perm.name
                    )}
                  </TableCell>

                  <TableCell
                    onDoubleClick={() => handleDoubleClick(perm, "description")}
                    className="cursor-pointer"
                  >
                    {editingCell?.id === perm.id &&
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
                      perm.description || "-"
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePermission.mutate({ id: perm.id })}
                    >
                      <Trash2 className="text-red-500" />
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

export default PermissionForm
