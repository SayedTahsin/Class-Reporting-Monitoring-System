import ClassHistoryTable from "@/components/class-history"
import { createFileRoute } from "@tanstack/react-router"
export const Route = createFileRoute("/")({
  component: HomeComponent,
})

function HomeComponent() {
  return <ClassHistoryTable userRoleName={"SuperAdmin"} />
}
