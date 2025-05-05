import { authClient } from "@/lib/auth-client"
import { trpc } from "@/utils/trpc"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession()

  const navigate = Route.useNavigate()

  // const privateData = useMutation(trpc.user.getById({ id: session?.user.id }))

  const {
    data: users,
    isFetching,
    isError,
  } = useQuery(trpc.user.getById.queryOptions())

  useEffect(() => {
    if (!session && !isPending) {
      navigate({
        to: "/login",
      })
    }
  }, [session, isPending, navigate])

  if (isPending) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {users?.map((user) => {
        return <p key={user.id}>{user.name}</p>
      })}
      <h1>Dashboard</h1>
      <p>Welcome {session?.user.name}</p>
    </div>
  )
}
