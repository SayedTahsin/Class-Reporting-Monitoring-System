import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import BatchForm from "./BatchForm"
import CourseForm from "./CourseForm"
import PBACForm from "./PbacForm"
import PermissionForm from "./PermissionForm"
import RoleForm from "./RoleForm"
import RoomForm from "./RoomForm"
import SlotForm from "./SlotForm"
import UserForm from "./UserForm"

type AdminTabProps = {
  userRoleName: string
}
const AdminTab = ({ userRoleName }: AdminTabProps) => {
  const isSuperAdmin = userRoleName === "SuperAdmin"
  return (
    <Tabs defaultValue="user" className="w-full">
      <TabsList
        className={`grid w-full ${isSuperAdmin ? "grid-cols-8" : "grid-cols-5"}`}
      >
        <TabsTrigger value="user">User</TabsTrigger>
        <TabsTrigger value="batch">Batch</TabsTrigger>
        <TabsTrigger value="course">Course</TabsTrigger>
        <TabsTrigger value="room">Room</TabsTrigger>
        <TabsTrigger value="slot">Slot</TabsTrigger>
        {isSuperAdmin && (
          <>
            <TabsTrigger value="role">Role</TabsTrigger>
            <TabsTrigger value="permission">Permission</TabsTrigger>
            <TabsTrigger value="pbac">PBAC</TabsTrigger>
          </>
        )}
      </TabsList>

      <TabsContent value="user">
        <UserForm />
      </TabsContent>
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
      {isSuperAdmin && (
        <>
          <TabsContent value="role">
            <RoleForm />
          </TabsContent>
          <TabsContent value="permission">
            <PermissionForm />
          </TabsContent>
          <TabsContent value="pbac">
            <PBACForm />
          </TabsContent>
        </>
      )}
    </Tabs>
  )
}

export default AdminTab
