import Loader from "@/components/loader"
import AdminTab from "@/components/tabs/AdminTab"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authClient } from "@/lib/auth-client"
import { authGuard } from "@/utils/auth-guard"
import { getTimeAgo } from "@/utils/days-ago"
import { trpc } from "@/utils/trpc"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { AlertCircle, BadgeCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  beforeLoad: async () => {
    await authGuard()
  },
})

function ProfilePage() {
  const { data: session } = authClient.useSession()

  const [userRoleName, setUserRoleName] = useState("Student")
  const isAdmin = ["SuperAdmin", "Chairman", "Teacher"].includes(userRoleName)

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: "",
      email: "",
      emailVerified: false,
      username: "",
      sectionId: "",
      phone: "",
      roleId: "",
      id: "",
    },
  })

  const { data: user, isFetching } = useQuery(trpc.user.getById.queryOptions())
  const { data: sectiones } = useQuery(trpc.section.getAll.queryOptions())
  const { data: role } = useQuery({
    ...trpc.role.getById.queryOptions({
      id: user?.[0]?.roleId || "",
    }),
    enabled: !!user?.[0]?.roleId,
  })

  const updateUser = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: () => {
        toast.success("Profile updated successfully.")
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }),
  )

  const onSubmit = handleSubmit((data) => {
    const updatedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== ""),
    )
    updateUser.mutate({
      ...updatedData,
      id: session?.user.id || "",
    })
  })

  const addPasskey = async () => {
    await authClient.passkey.addPasskey()
  }

  useEffect(() => {
    if (user) {
      const u = user[0]
      reset({
        name: u.name,
        email: u.email,
        id: u.id,
        emailVerified: u.emailVerified,
        username: u.username || "",
        sectionId: u.sectionId || "",
        phone: u.phone || "",
        roleId: u.roleId || "",
      })
      if (u.roleId) {
        setUserRoleName(role?.[0]?.name ?? "Student")
      }
    }
  }, [user, reset, role])

  if (isFetching || !user) return <Loader />

  const emailVerified = watch("emailVerified")
  const createdAgo = getTimeAgo(user[0].createdAt)
  const updatedAgo = getTimeAgo(user[0].updatedAt || "")

  return (
    <Tabs defaultValue="profile" className="mx-auto mt-4 w-full max-w-5xl">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-4">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register("name")} />
                </div>
                <div>
                  <Label htmlFor="roleId">Role</Label>
                  <Input id="roleId" value={userRoleName} disabled />
                </div>
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...register("username")} />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    disabled
                    {...register("email")}
                    className="flex-1"
                  />
                  {!emailVerified ? (
                    <button
                      type="button"
                      className="text-red-500"
                      title="Click to send verification email"
                    >
                      <AlertCircle className="h-5 w-5" />
                    </button>
                  ) : (
                    <div className="text-green-600" title="Email is verified">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>

              <div>
                <Label htmlFor="sectionId">Section</Label>
                <select
                  id="sectionId"
                  {...register("sectionId")}
                  className="w-full rounded-md border border-input bg-background p-2 text-foreground text-sm"
                >
                  <option value="">Select Section</option>
                  {sectiones?.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button type="button" onClick={addPasskey}>
                  Add Passkey
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>

              <p className="pt-4 text-muted-foreground text-xs">
                Profile created {createdAgo}
                {updatedAgo && <span> and updated {updatedAgo}.</span>}
              </p>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="admin">
        {isAdmin && <AdminTab userRoleName={userRoleName} />}
      </TabsContent>
    </Tabs>
  )
}
