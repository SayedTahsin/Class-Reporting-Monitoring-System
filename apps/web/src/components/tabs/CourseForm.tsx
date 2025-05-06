import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { trpc } from "@/utils/trpc"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

const CourseForm = () => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      code: "",
      title: "",
      credits: 0,
    },
  })

  const mutation = useMutation(trpc.course.create.mutationOptions())

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data)
  })

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Course Code</Label>
            <Input id="code" {...register("code", { required: true })} />
          </div>
          <div>
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" {...register("title", { required: true })} />
          </div>
          <div>
            <Label htmlFor="credits">Credits</Label>
            <Input id="credits" {...register("credits", { required: true })} />
          </div>
          <Button type="submit">Create Course</Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default CourseForm
