import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { trpc } from "@/utils/trpc"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

const RoomForm = () => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: "",
    },
  })

  const mutation = useMutation(trpc.room.create.mutationOptions())

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data)
  })

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Room Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <Button type="submit">Create Room</Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default RoomForm
