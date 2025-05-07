import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { trpc } from "@/utils/trpc"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type User = {
  id: string
  name: string
  username: string | null
  phone: string | null
  email: string
}

const BatchForm = () => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
    },
  })

  const [selectedBatchId, setSelectedBatchId] = useState("")
  const [selectedBatchName, setSelectedBatchName] = useState("")
  const [userList, setUserList] = useState<User[]>([])

  const { data: batches, refetch } = useQuery(trpc.batch.getAll.queryOptions())

  const createBatch = useMutation(
    trpc.batch.create.mutationOptions({
      onSuccess: () => {
        toast.success("Batch created successfully!")
        reset()
        refetch()
      },
      onError: (err) => {
        toast.error(err.message)
      },
    }),
  )

  const updateBatch = useMutation(
    trpc.batch.update.mutationOptions({
      onSuccess: () => {
        toast.success("Batch name updated!")
        refetch()
      },
      onError: (err) => {
        toast.error(err.message)
      },
    }),
  )

  const getuserListByBatch = useMutation(
    trpc.user.getByBatch.mutationOptions({
      onError: (err) => {
        toast.error(err.message)
      },
    }),
  )

  const onSubmit = handleSubmit((data) => {
    createBatch.mutate(data)
  })

  const handleBatchSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const batchId = e.target.value
    setSelectedBatchId(batchId)

    const batchName = batches?.find((b) => b.id === batchId)?.name ?? ""
    setSelectedBatchName(batchName)

    if (batchId) {
      const res = await getuserListByBatch.mutateAsync({ batchId })
      const users = res || []
      setUserList(users)
    } else {
      setUserList([])
      setSelectedBatchName("")
    }
  }

  const handleBatchRename = () => {
    if (!selectedBatchId || !selectedBatchName.trim()) return
    updateBatch.mutate({ id: selectedBatchId, name: selectedBatchName })
  }

  return (
    <Card>
      <CardContent className="space-y-6 py-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Create New Batch</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <Button type="submit">Create Batch</Button>
        </form>

        <div>
          <Label htmlFor="batch-select">Existing Batches</Label>
          <select
            id="batch-select"
            className="mt-1 block w-full rounded-md border bg-background px-3 py-2 text-foreground"
            onChange={handleBatchSelect}
            value={selectedBatchId}
          >
            <option value="">Select a batch</option>
            {batches?.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>

        {selectedBatchId && (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="edit-batch-name">Edit Batch Name</Label>
              <Input
                id="edit-batch-name"
                value={selectedBatchName}
                onChange={(e) => setSelectedBatchName(e.target.value)}
              />
            </div>
            <Button onClick={handleBatchRename}>Update</Button>
          </div>
        )}

        {userList.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userList.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.username || "-"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

export default BatchForm
