import { TRPCClientError } from "@trpc/client"

type HandleOptions = {
  fallbackMessage?: string
}

export function handleErrorMsg(
  error: unknown,
  options: HandleOptions = {},
): string {
  const fallbackMessage =
    options.fallbackMessage || "An unexpected error occurred."

  if (error instanceof TRPCClientError) {
    const zodErrors = error?.data?.zodError?.fieldErrors
    if (zodErrors) {
      const flat = Object.values(zodErrors).flat()
      return flat.join(", ") || fallbackMessage
    }

    const lowerMsg = error.message.toLowerCase()

    if (lowerMsg.includes("invalid credentials"))
      return "Invalid email or password."
    if (lowerMsg.includes("email not verified"))
      return "Please verify your email to continue."
    if (lowerMsg.includes("token expired"))
      return "Your session has expired. Please log in again."
    if (lowerMsg.includes("forbidden"))
      return "You don’t have permission to perform this action."
    if (lowerMsg.includes("not authenticated"))
      return "Please log in to continue."

    return error.message || fallbackMessage
  }

  if (error instanceof Error) {
    const lowerMsg = error.message.toLowerCase()

    if (lowerMsg.includes("not authenticated")) return "Please log in first."
    if (lowerMsg.includes("no role assigned"))
      return "You are not assigned to any role."
    if (lowerMsg.includes("forbidden")) return "Access denied."
    if (lowerMsg.includes("unique constraint"))
      return "This entry already exists."

    return error.message || fallbackMessage
  }

  return fallbackMessage
}
