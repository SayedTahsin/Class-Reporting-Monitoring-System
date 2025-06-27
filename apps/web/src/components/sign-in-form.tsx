import { authClient } from "@/lib/auth-client"
import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void
}) {
  const { refetch } = authClient.useSession()
  const navigate = useNavigate({
    from: "/",
  })

  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({ to: "/" })
            toast.success("Sign in successful")
          },
          onError: (error) => {
            toast.error(error.error.message)
          },
        },
      )
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      }),
    },
  })

  const signWithPasskey = async () => {
    try {
      const result = await authClient.signIn.passkey()
      if (!result?.error) {
        refetch()
        navigate({ to: "/" })
        toast.success("Sign in successful")
      }
    } catch (error) {
      toast.error("Login failed")
    }
  }

  const onForgotPassword = async () => {
    setIsLoading(true)
    const { data, error } = await authClient.forgetPassword({
      email: form.getFieldValue("email"),
      redirectTo: "/reset-password",
    })
    if (data?.status) {
      toast.success("Password reset link sent! Check your email.")
    } else {
      toast.error(error?.message || "Failed to send password reset link.")
    }
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border p-6 shadow-sm">
        <h1 className="mb-4 text-center font-semibold text-2xl">Sign In</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field name="email">
            {(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  disabled={isLoading}
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

          <form.Field name="password">
            {(field) => (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.name}>Password</Label>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="text-indigo-600 text-sm hover:underline disabled:opacity-50"
                    onClick={onForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  disabled={isLoading}
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
                disabled={!state.canSubmit || state.isSubmitting || isLoading}
              >
                {state.isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <div className="mt-4 space-y-2 text-center">
          <Button
            variant="outline"
            className="w-full text-sm"
            onClick={signWithPasskey}
            disabled={isLoading}
          >
            Sign in with Passkey
          </Button>
          <p className="text-muted-foreground text-sm">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-indigo-600 hover:underline disabled:opacity-50"
              disabled={isLoading}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
