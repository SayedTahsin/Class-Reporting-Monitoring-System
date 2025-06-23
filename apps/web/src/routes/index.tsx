import ClassHistoryTable from "@/components/class-history"
import Loader from "@/components/loader"
import { authGuard } from "@/utils/auth-guard"
import { useSetUserStore } from "@/utils/set-user-store"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: HomeComponent,
  beforeLoad: async () => {
    await authGuard()
  },
})

function HomeComponent() {
  const user = useSetUserStore()
  if (!user) return <Loader />
  return <ClassHistoryTable user={user} />
}
