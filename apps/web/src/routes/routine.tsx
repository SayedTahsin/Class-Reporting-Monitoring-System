import RoutineView from "@/components/routine"
import { authGuard } from "@/utils/auth-guard"
import { createFileRoute } from "@tanstack/react-router"
export const Route = createFileRoute("/routine")({
  component: RoutineComponent,
  beforeLoad: async () => {
    await authGuard()
  },
})

function RoutineComponent() {
  return <RoutineView />
}
