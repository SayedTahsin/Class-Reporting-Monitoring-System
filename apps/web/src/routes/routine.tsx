import RoutineView from "@/components/routine"
import { createFileRoute } from "@tanstack/react-router"
export const Route = createFileRoute("/routine")({
  component: RoutineComponent,
})

function RoutineComponent() {
  return <RoutineView />
}
