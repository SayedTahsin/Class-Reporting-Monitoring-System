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

type FormData = {
  name?: string
  username?: string
  phone?: string
  image?: string
  sectionId?: string
  roleId?: string
}

const UserForm = () => {
  const [editingCell, setEditingCell] = useState<{
    userId: string
    field: keyof FormData
  } | null>(null)

  const { data: users, refetch } = useQuery(trpc.user.getAll.queryOptions())
  const { data: sectiones } = useQuery(trpc.section.getAll.queryOptions())
  const { data: roles } = useQuery(trpc.role.getAll.queryOptions())

  const updateUser = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: () => {
        toast.success("User updated successfully")
        refetch()
        setEditingCell(null)
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const handleUpdate = (
    id: string,
    field: keyof FormData,
    value: string | undefined,
  ) => {
    updateUser.mutate({ id, [field]: value })
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username ?? "-"}</TableCell>
                <TableCell>{user.phone ?? "-"}</TableCell>
                <TableCell>
                  {sectiones?.find((b) => b.id === user.sectionId)?.name ?? "-"}
                </TableCell>

                <TableCell
                  onDoubleClick={() =>
                    setEditingCell({ userId: user.id, field: "roleId" })
                  }
                  className="cursor-pointer"
                >
                  {editingCell?.userId === user.id &&
                  editingCell.field === "roleId" ? (
                    <select
                      defaultValue={user.roleId ?? ""}
                      onBlur={(e) =>
                        handleUpdate(user.id, "roleId", e.target.value)
                      }
                      className="w-full rounded bg-background p-1 text-foreground"
                    >
                      {roles?.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    (roles?.find((r) => r.id === user.roleId)?.name ?? "-")
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default UserForm
