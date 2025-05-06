import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { trpc } from "@/utils/trpc"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

const PermissionForm = () => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const mutation = useMutation(trpc.permission.create.mutationOptions())

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data)
  })

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Permission Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <div>
            <Label htmlFor="description">Permission Description</Label>
            <Input id="description" {...register("description")} />
          </div>
          <Button type="submit">Create Permission</Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default PermissionForm
