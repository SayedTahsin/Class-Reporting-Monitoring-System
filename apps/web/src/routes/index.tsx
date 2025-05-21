import HomeView from "@/components/home"
import { createFileRoute } from "@tanstack/react-router"
export const Route = createFileRoute("/")({
  component: HomeComponent,
})

function HomeComponent() {
  return <HomeView />
}
