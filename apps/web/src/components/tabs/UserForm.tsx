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
import { useDebounce } from "@uidotdev/usehooks"
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

const PAGE_LIMIT = 10

const UserForm = () => {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [sectionFilter, setSectionFilter] = useState<string>("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [editingCell, setEditingCell] = useState<{
    userId: string
    field: keyof FormData
  } | null>(null)

  const { data: sections } = useQuery(trpc.section.getAll.queryOptions())
  const { data: roles } = useQuery(trpc.role.getAll.queryOptions())

  const queryInput = {
    page,
    limit: PAGE_LIMIT,
    q: debouncedSearchTerm,
    sectionId: sectionFilter || undefined,
    roleId: roleFilter || undefined,
  }

  const {
    data: result = { data: [], total: 0, hasNext: false },
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery(trpc.user.filter.queryOptions(queryInput))

  const users = result.data || []
  const hasNext = result.hasNext || false

  const updateUser = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: () => {
        toast.success("User updated successfully")
        refetch()
        setEditingCell(null)
      },
      onError: (err) => toast.error(err.message),
    })
  )

  const handleUpdate = (
    id: string,
    field: keyof FormData,
    value: string | undefined
  ) => {
    updateUser.mutate({ id, [field]: value })
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="flex-1"
          />

          <select
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value)
              setPage(1)
            }}
            className="rounded bg-background p-1 text-foreground"
          >
            <option value="">All Sections</option>
            {sections?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className="rounded bg-background p-1 text-foreground"
          >
            <option value="">All Roles</option>
            {roles?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-4 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-4 text-center text-red-500"
                >
                  Error loading users: {error?.message}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && (
              <>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username ?? "-"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone ?? "-"}</TableCell>
                    <TableCell>
                      {sections?.find((b) => b.id === user.sectionId)?.name ??
                        "-"}
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

                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between">
          <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
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
              className="w-14 p-1 text-center"
            />
          </div>

          <Button
            disabled={!hasNext || users.length === 0}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserForm
