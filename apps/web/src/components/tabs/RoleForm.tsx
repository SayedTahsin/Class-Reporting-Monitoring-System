import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Role = {
  id: string;
  name: string;
  description: string | null;
};

const RoleForm = () => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { data: roles = [], refetch } = useQuery(
    trpc.role.getAll.queryOptions()
  );

  const createRole = useMutation(
    trpc.role.create.mutationOptions({
      onSuccess: () => {
        toast.success("Role created!");
        reset();
        refetch();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const updateRole = useMutation(
    trpc.role.update.mutationOptions({
      onSuccess: () => {
        toast.success("Role updated!");
        refetch();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const deleteRole = useMutation(
    trpc.role.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Role deleted.");
        refetch();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: "name" | "description";
  } | null>(null);

  const [editValue, setEditValue] = useState("");

  const onSubmit = handleSubmit((data) => {
    createRole.mutate({
      name: data.name,
      description: data.description || undefined,
    });
  });

  const handleDoubleClick = (role: Role, field: "name" | "description") => {
    setEditingCell({ id: role.id, field });
    setEditValue(role[field] ?? "");
  };

  const handleEditBlur = () => {
    if (editingCell && editValue.trim() !== "") {
      const payload = {
        id: editingCell.id,
        [editingCell.field]: editValue,
      };
      updateRole.mutate(payload);
    }
    setEditingCell(null);
    setEditValue("");
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Role Name</Label>
              <Input id="name" {...register("name", { required: true })} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register("description")} />
            </div>
          </div>
          <Button type="submit" className="w-full sm:w-fit">
            Create Role
          </Button>
        </form>

        <div className="space-y-2">
          <Label className="text-base">Existing Roles</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role: Role) => (
                <TableRow key={role.id}>
                  <TableCell
                    onDoubleClick={() => handleDoubleClick(role, "name")}
                    className="cursor-pointer"
                  >
                    {editingCell?.id === role.id &&
                    editingCell.field === "name" ? (
                      <Input
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditBlur}
                        onKeyDown={(e) =>
                          e.key === "Enter" && e.currentTarget.blur()
                        }
                      />
                    ) : (
                      role.name
                    )}
                  </TableCell>
                  <TableCell
                    onDoubleClick={() => handleDoubleClick(role, "description")}
                    className="cursor-pointer"
                  >
                    {editingCell?.id === role.id &&
                    editingCell.field === "description" ? (
                      <Input
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditBlur}
                        onKeyDown={(e) =>
                          e.key === "Enter" && e.currentTarget.blur()
                        }
                      />
                    ) : (
                      role.description || "-"
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRole.mutate({ id: role.id })}
                    >
                      <Trash2 className="text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleForm;
