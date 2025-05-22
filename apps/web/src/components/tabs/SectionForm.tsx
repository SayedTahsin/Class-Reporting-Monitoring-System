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
import { Trash2 } from "lucide-react"
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

type AdminTabProps = {
  userRoleName: string
}

const SectionForm = ({ userRoleName }: AdminTabProps) => {
  const isSuperAdmin = userRoleName === "SuperAdmin"
  const isChairman = userRoleName === "Chairman"
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
    },
  })

  const [selectedSectionId, setSelectedSectionId] = useState("")
  const [selectedSectionName, setSelectedSectionName] = useState("")
  const [userList, setUserList] = useState<User[]>([])

  const { data: sectiones, refetch } = useQuery(
    trpc.section.getAll.queryOptions(),
  )

  const createSection = useMutation(
    trpc.section.create.mutationOptions({
      onSuccess: () => {
        toast.success("Section created successfully!")
        reset()
        refetch()
      },
      onError: (err) => {
        toast.error(err.message)
      },
    }),
  )

  const updateSection = useMutation(
    trpc.section.update.mutationOptions({
      onSuccess: () => {
        toast.success("Section name updated!")
        refetch()
      },
      onError: (err) => {
        toast.error(err.message)
      },
    }),
  )

  const deleteSection = useMutation(
    trpc.section.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Section deleted successfully!")
        setSelectedSectionId("")
        setSelectedSectionName("")
        setUserList([])
        refetch()
      },
      onError: (err) => {
        toast.error(err.message)
      },
    }),
  )

  const getuserListBySection = useMutation(
    trpc.user.getBySection.mutationOptions({
      onError: (err) => {
        toast.error(err.message)
      },
    }),
  )

  const onSubmit = handleSubmit((data) => {
    createSection.mutate(data)
  })

  const handleSectionSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const sectionId = e.target.value
    setSelectedSectionId(sectionId)

    const sectionName = sectiones?.find((b) => b.id === sectionId)?.name ?? ""
    setSelectedSectionName(sectionName)

    if (sectionId) {
      const res = await getuserListBySection.mutateAsync({ sectionId })
      const users = res || []
      setUserList(users)
    } else {
      setUserList([])
      setSelectedSectionName("")
    }
  }

  const handleSectionRename = () => {
    if (!selectedSectionId || !selectedSectionName.trim()) return
    updateSection.mutate({ id: selectedSectionId, name: selectedSectionName })
  }

  const handleSectionDelete = () => {
    if (!selectedSectionId) return
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this section?",
    )
    if (confirmDelete) {
      deleteSection.mutate({ id: selectedSectionId })
    }
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        {(isChairman || isSuperAdmin) && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Create New Section</Label>
              <Input id="name" {...register("name", { required: true })} />
            </div>
            <Button type="submit">Create Section</Button>
          </form>
        )}

        <div>
          <Label htmlFor="section-select">Existing Sectiones</Label>
          <select
            id="section-select"
            className="w-full rounded-md border bg-background p-2 text-foreground"
            onChange={handleSectionSelect}
            value={selectedSectionId}
          >
            <option value="">Select a section</option>
            {sectiones?.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        {selectedSectionId && (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="edit-section-name">Edit Section Name</Label>
              <Input
                id="edit-section-name"
                value={selectedSectionName}
                onChange={(e) => setSelectedSectionName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(isChairman || isSuperAdmin) && (
                <Button onClick={handleSectionRename}>Update</Button>
              )}
              {isSuperAdmin && (
                <Button variant="ghost" onClick={handleSectionDelete}>
                  <Trash2 className=" text-red-500" />
                </Button>
              )}
            </div>
          </div>
        )}

        {userList.length > 0 && (
          <Card>
            <CardContent>
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

export default SectionForm
