import Loader from "@/components/loader"
import AdminTab from "@/components/tabs/AdminTab"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authClient } from "@/lib/auth-client"
import { getTimeAgo } from "@/utils/daysAgo"
import { trpc } from "@/utils/trpc"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { AlertCircle, BadgeCheck } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: session, isPending } = authClient.useSession()
  const navigate = Route.useNavigate()

  const { data: user, isFetching } = useQuery(trpc.user.getById.queryOptions())
  const { data: batches } = useQuery(trpc.batch.getAll.queryOptions())
  const { data: roles } = useQuery(trpc.role.getAll.queryOptions())

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: "",
      email: "",
      emailVerified: false,
      username: "",
      batchId: "",
      phone: "",
      roleId: "",
      id: "",
    },
  })

  useEffect(() => {
    if (!session && !isPending) {
      navigate({ to: "/login" })
    }
  }, [session, isPending, navigate])

  useEffect(() => {
    if (user) {
      const u = user[0]
      reset({
        name: u.name,
        email: u.email,
        id: u.id,
        emailVerified: u.emailVerified,
        username: u.username || "",
        batchId: u.batchId || "",
        phone: u.phone || "",
        roleId: u.roleId || "",
      })
    }
  }, [user, reset])

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
    updateUser.mutate({ ...data, id: session?.user.id || "" })
  })

  const handleSendVerification = () => {
    toast.info("Verification email sent.")
  }

  if (isPending || isFetching || !user) return <Loader />

  const emailVerified = watch("emailVerified")
  const createdAgo = getTimeAgo(user[0].createdAt)
  const updatedAgo = getTimeAgo(user[0].updatedAt || "")
  const userRoleName =
    roles?.find((role) => role.id === user?.[0]?.roleId)?.name || ""

  const isAdmin = ["SuperAdmin", "Chairman", "Teacher"].includes(userRoleName)

  return (
    <Tabs defaultValue="profile" className="mx-auto mt-2 w-full max-w-5xl">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="w-[80%]">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register("name")} />
                </div>
                <div className="w-[20%]">
                  <Label htmlFor="roleId">Role</Label>
                  <Input
                    id="roleId"
                    value={
                      roles?.find((role) => role.id === user[0].roleId)?.name ??
                      "Student"
                    }
                    disabled
                  />
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
                      onClick={handleSendVerification}
                      className="text-red-500"
                      title="Click to send verification email"
                    >
                      <AlertCircle />
                    </button>
                  ) : (
                    <div className="text-green-600" title="Email is verified">
                      <BadgeCheck />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>

              <div>
                <Label htmlFor="batchId">Batch</Label>
                <select
                  id="batchId"
                  {...register("batchId")}
                  className="w-full rounded-md border border-input bg-background p-2 text-foreground"
                >
                  <option>Select Batch</option>
                  {batches?.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit">Save Changes</Button>

              <p className="pt-4 text-sm">
                Profile created {createdAgo}{" "}
                {updatedAgo !== null && <span>and updated {updatedAgo}.</span>}
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
