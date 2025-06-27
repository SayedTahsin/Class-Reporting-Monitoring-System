import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { authGuard } from "@/utils/auth-guard"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordForm,
  beforeLoad: async () => {
    await authGuard("/reset-password")
  },
})

export default function ResetPasswordForm() {
  const navigate = useNavigate({ from: "/reset-password" })

  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get("token")
    if (!urlToken) {
      toast.error("Invalid or missing reset token")
    }
    setToken(urlToken)
  }, [])

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Missing token. Cannot reset password.")
        return
      }

      const { data, error } = await authClient.resetPassword({
        newPassword: value.password,
        token,
      })

      if (data?.status) {
        toast.success("Password has been reset successfully.")
        navigate({ to: "/" })
      } else {
        toast.error(error?.message || "Failed to reset password.")
      }
    },
    validators: {
      onSubmit: z
        .object({
          password: z.string().min(6, "Password must be at least 6 characters"),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        }),
    },
  })

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border p-6 shadow-sm">
        <h1 className="mb-4 text-center font-semibold text-2xl">
          Reset Password
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field name="password">
            {(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>New Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500 text-sm">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Confirm Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500 text-sm">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Subscribe>
            {(state) => (
              <Button
                type="submit"
                className="w-full"
                disabled={!state.canSubmit || state.isSubmitting || !token}
              >
                {state.isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  )
}
