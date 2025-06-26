import { authClient } from "@/lib/auth-client"
import { redirect } from "@tanstack/react-router"

export async function authGuard(to?: string) {
  const session = await authClient.getSession()
  if (!session.data && to !== "/verification" && to !== "/reset-password")
    throw redirect({ to: "/login" })
  if (
    session.data &&
    (to === "/verification" || to === "/login" || to === "/reset-password")
  )
    throw redirect({ to: "/" })
  return true
}
