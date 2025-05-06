import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import BatchForm from "./BatchForm"
import CourseForm from "./CourseForm"
import PermissionForm from "./PermissionForm"
import RoleForm from "./RoleForm"
import RoomForm from "./RoomForm"
import SlotForm from "./SlotForm"

const AdminTab = () => {
  return (
    <Tabs defaultValue="batch" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="batch">Batch</TabsTrigger>
        <TabsTrigger value="course">Course</TabsTrigger>
        <TabsTrigger value="room">Room</TabsTrigger>
        <TabsTrigger value="slot">Slot</TabsTrigger>
        <TabsTrigger value="role">Role</TabsTrigger>
        <TabsTrigger value="permission">Permission</TabsTrigger>
      </TabsList>

      <TabsContent value="batch">
        <BatchForm />
      </TabsContent>
      <TabsContent value="course">
        <CourseForm />
      </TabsContent>
      <TabsContent value="room">
        <RoomForm />
      </TabsContent>
      <TabsContent value="slot">
        <SlotForm />
      </TabsContent>
      <TabsContent value="role">
        <RoleForm />
      </TabsContent>
      <TabsContent value="permission">
        <PermissionForm />
      </TabsContent>
    </Tabs>
  )
}

export default AdminTab
