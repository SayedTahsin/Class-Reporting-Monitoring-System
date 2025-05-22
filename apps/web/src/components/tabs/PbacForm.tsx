import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { useForm } from "react-hook-form"
import { toast } from "sonner"

const PBACForm = () => {
  const {
    register: registerUserRole,
    handleSubmit: handleUserRoleSubmit,
    reset: resetUserRole,
  } = useForm({
    defaultValues: {
      userId: "",
      roleId: "",
    },
  })

  const {
    register: registerRolePermission,
    handleSubmit: handleRolePermissionSubmit,
    reset: resetRolePermission,
  } = useForm({
    defaultValues: {
      roleId: "",
      permissionId: "",
    },
  })

  const { data: userRoles, refetch: refetchUserRoles } = useQuery(
    trpc.userRole.getAll.queryOptions(),
  )
  const { data: rolePermissions, refetch: refetchRolePermissions } = useQuery(
    trpc.rolePermission.getAll.queryOptions(),
  )

  const { data: users } = useQuery(trpc.user.getAll.queryOptions())
  const { data: roles } = useQuery(trpc.role.getAll.queryOptions())
  const { data: permissions } = useQuery(trpc.permission.getAll.queryOptions())

  const assignUserRole = useMutation(
    trpc.userRole.assign.mutationOptions({
      onSuccess: () => {
        toast.success("Role assigned to user")
        refetchUserRoles()
        resetUserRole()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const removeUserRole = useMutation(
    trpc.userRole.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Role removed from user")
        refetchUserRoles()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const assignRolePermission = useMutation(
    trpc.rolePermission.assign.mutationOptions({
      onSuccess: () => {
        toast.success("Permission assigned to role")
        refetchRolePermissions()
        resetRolePermission()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const removeRolePermission = useMutation(
    trpc.rolePermission.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Permission removed from role")
        refetchRolePermissions()
      },
      onError: (err) => toast.error(err.message),
    }),
  )

  const handleUserRole = handleUserRoleSubmit((data) => {
    assignUserRole.mutate(data)
  })

  const handleRolePermission = handleRolePermissionSubmit((data) => {
    assignRolePermission.mutate(data)
  })

  return (
    <Card>
      <CardContent className="space-y-10">
        <div>
          <h2 className="mb-2 font-semibold text-lg">Assign Role to User</h2>
          <form onSubmit={handleUserRole}>
            <div className="grid grid-cols-2 items-end gap-2">
              <div>
                <Label htmlFor="user">User</Label>
                <select
                  id="user"
                  {...registerUserRole("userId", { required: true })}
                  className="w-full rounded bg-background p-1 text-foreground"
                >
                  <option value="">Select user</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  {...registerUserRole("roleId", { required: true })}
                  className="w-full rounded bg-background p-1 text-foreground"
                >
                  <option value="">Select role</option>
                  {roles?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <Button type="submit">Assign Role</Button>
              </div>
            </div>
          </form>

          <div className="mt-6">
            <Label>Assigned Roles</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
                  <TableHead>Role Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles?.map((ur) => (
                  <TableRow key={`${ur.userId}-${ur.roleId}`}>
                    <TableCell>
                      {users?.find((u) => u.id === ur.userId)?.email ||
                        ur.userId}
                    </TableCell>
                    <TableCell>
                      {roles?.find((r) => r.id === ur.roleId)?.name ||
                        ur.roleId}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeUserRole.mutate({
                            userId: ur.userId,
                            roleId: ur.roleId,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="mb-2 font-semibold text-lg">
            Assign Permission to Role
          </h2>
          <form onSubmit={handleRolePermission}>
            <div className="grid grid-cols-2 items-end gap-4">
              <div>
                <Label htmlFor="rolePermission-role">Role</Label>
                <select
                  id="rolePermission-role"
                  {...registerRolePermission("roleId", { required: true })}
                  className="w-full rounded bg-background p-1 text-foreground"
                >
                  <option value="">Select role</option>
                  {roles?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="permission">Permission</Label>
                <select
                  id="permission"
                  {...registerRolePermission("permissionId", {
                    required: true,
                  })}
                  className="w-full rounded bg-background p-1 text-foreground"
                >
                  <option value="">Select permission</option>
                  {permissions?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <Button type="submit">Assign Permission</Button>
              </div>
            </div>
          </form>

          <div className="mt-6">
            <Label>Assigned Role Permissions</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Permission Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolePermissions?.map((rp) => (
                  <TableRow key={`${rp.roleId}-${rp.permissionId}`}>
                    <TableCell>
                      {roles?.find((r) => r.id === rp.roleId)?.name ||
                        rp.roleId}
                    </TableCell>
                    <TableCell>
                      {permissions?.find((p) => p.id === rp.permissionId)
                        ?.name || rp.permissionId}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeRolePermission.mutate({
                            roleId: rp.roleId,
                            permissionId: rp.permissionId,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PBACForm
