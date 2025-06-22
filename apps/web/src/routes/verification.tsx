import { Button } from "@/components/ui/button"
import { authGuard } from "@/utils/auth-guard"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

export const Route = createFileRoute("/verification")({
  component: RouteComponent,
  beforeLoad: async () => {
    await authGuard("/verification")
  },
})

function RouteComponent() {
  const navigate = useNavigate()

  return (
    <div
      className="flex flex-col justify-start px-4"
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      <div className="mx-auto mt-20 w-full max-w-sm rounded-xl border p-6 text-center shadow-sm">
        <h1 className="mb-2 font-semibold text-2xl">Verify Your Email</h1>
        <p className="mb-4 text-muted-foreground text-sm">
          A verification link has been sent to your email address. Please check
          your inbox and follow the instructions to activate your account.
        </p>

        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={() => navigate({ to: "/login" })}
        >
          Go to Login
        </Button>
      </div>
    </div>
  )
}
