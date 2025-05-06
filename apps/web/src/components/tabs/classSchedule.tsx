import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { trpc } from "@/utils/trpc"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

const ClassScheduleForm = () => {
  const { register, handleSubmit } = useForm()
  const mutation = useMutation(trpc.classSchedule.create.mutationOptions())

  const onSubmit = (data: any) => {
    mutation.mutate(data)
  }

  return (
