import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  batchId?: string
  roleId?: string
}

const UserForm = () => {
  const [editingCell, setEditingCell] = useState<{
    userId: string
    field: keyof FormData
  } | null>(null)

  const { data: users, refetch: refetchUsers } = useQuery(
    trpc.user.getAll.queryOptions(),
  )
  const { data: batches } = useQuery(trpc.batch.getAll.queryOptions())
  const { data: roles } = useQuery(trpc.role.getAll.queryOptions())

  const updateUser = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: () => {
        toast.success("User updated successfully")
        refetchUsers()
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
      <CardContent className="space-y-6 py-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell
                  onDoubleClick={() =>
                    setEditingCell({ userId: user.id, field: "name" })
                  }
                  className="cursor-pointer"
                >
                  {editingCell?.userId === user.id &&
                  editingCell.field === "name" ? (
                    <Input
                      defaultValue={user.name ?? ""}
                      onBlur={(e) => {
                        handleUpdate(user.id, "name", e.target.value)
                      }}
                      autoFocus
                    />
                  ) : (
                    (user.name ?? "-")
                  )}
                </TableCell>

                <TableCell>{user.username ?? "-"}</TableCell>

                <TableCell>{user.phone ?? "-"}</TableCell>

                <TableCell
                  onDoubleClick={() =>
                    setEditingCell({ userId: user.id, field: "batchId" })
                  }
                  className="cursor-pointer"
                >
                  {editingCell?.userId === user.id &&
                  editingCell.field === "batchId" ? (
                    <select
                      defaultValue={user.batchId ?? ""}
                      onBlur={(e) =>
                        handleUpdate(user.id, "batchId", e.target.value)
                      }
                      className="w-full rounded border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <option value="">Select batch</option>
                      {batches?.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    (batches?.find((b) => b.id === user.batchId)?.name ?? "-")
                  )}
                </TableCell>

                {/* Role cell */}
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
                      className="w-full rounded border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <option value="">Select role</option>
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
