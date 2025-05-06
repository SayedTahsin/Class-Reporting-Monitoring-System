import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { trpc } from "@/utils/trpc"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

const SlotForm = () => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      startTime: "",
      endTime: "",
    },
  })

  const mutation = useMutation(trpc.slot.create.mutationOptions())

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data)
  })

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              {...register("startTime", { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input id="endTime" {...register("endTime", { required: true })} />
          </div>
          <Button type="submit">Create Slot</Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default SlotForm
