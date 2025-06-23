import { trpc } from "@/utils/trpc"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useIsLoggedIn, useUser } from "../hooks/useUser"
import { useAppDispatch } from "../store/hooks"
import { setUser } from "../store/slices/userSlice"

export const useSetUserStore = () => {
  const dispatch = useAppDispatch()
  const isLoggedIn = useIsLoggedIn()

  const { data: loggedInUser } = useQuery({
    ...trpc.user.getById.queryOptions(),
    enabled: !isLoggedIn,
  })

  const { data: role } = useQuery({
    ...trpc.role.getById.queryOptions({
      id: loggedInUser?.[0]?.roleId || "",
    }),
    enabled: !!loggedInUser?.[0]?.roleId && !isLoggedIn,
  })

  useEffect(() => {
    if (!isLoggedIn && loggedInUser?.length && role?.length) {
      const u = loggedInUser[0]
      const userRoleName = role?.[0]?.name ?? "Student"
      dispatch(
        setUser({
          id: u.id ?? "",
          name: u.name ?? "",
          email: u.email ?? "",
          isLoggedIn: true,
          sectionId: u.sectionId ?? "",
          roleName: userRoleName || "Student",
          roleId: u.roleId ?? "",
          emailVerified: u.emailVerified ?? false,
          username: u.username ?? "",
          createdAt: u.createdAt ?? "",
          updatedAt: u.updatedAt ?? "",
          phone: u.phone ?? "",
        }),
      )
    }
  }, [isLoggedIn, loggedInUser, role, dispatch])

  return useUser()
}
