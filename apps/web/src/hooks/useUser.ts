import { useAppSelector } from "../store/hooks"

export const useUser = () => useAppSelector((state) => state.user?.user)
export const useIsLoggedIn = () =>
  useAppSelector((state) => state.user?.user?.isLoggedIn ?? false)
