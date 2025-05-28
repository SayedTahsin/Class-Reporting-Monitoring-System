import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import ClassScheduleForm from "./ClassScheduleTab"
import CourseForm from "./CourseForm"
import PBACForm from "./PbacForm"
import PermissionForm from "./PermissionForm"
import RoleForm from "./RoleForm"
import RoomForm from "./RoomForm"
import SectionForm from "./SectionForm"
import SlotForm from "./SlotForm"
import UserForm from "./UserForm"

type AdminTabProps = {
  userRoleName: string
}
const AdminTab = ({ userRoleName }: AdminTabProps) => {
  const isSuperAdmin = userRoleName === "SuperAdmin"
  const isTeacher = userRoleName === "Teacher"
  const isChairman = userRoleName === "Chairman"
  return (
    <Tabs
      defaultValue={isTeacher ? "class_schedule" : "user"}
      className="w-full"
    >
      <TabsList
        className={`grid w-full ${isSuperAdmin ? "grid-cols-9" : isTeacher ? "grid-cols-5" : "grid-cols-6"}`}
      >
        {(isSuperAdmin || isChairman) && (
          <TabsTrigger value="user">User</TabsTrigger>
        )}
        <TabsTrigger value="class_schedule">Class Schedule</TabsTrigger>
        <TabsTrigger value="section">Section</TabsTrigger>
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

      {(isSuperAdmin || isChairman) && (
        <TabsContent value="user">
          <UserForm />
        </TabsContent>
      )}
      <TabsContent value="class_schedule">
        <ClassScheduleForm />
      </TabsContent>
      <TabsContent value="section">
        <SectionForm userRoleName={userRoleName} />
      </TabsContent>
      <TabsContent value="course">
        <CourseForm userRoleName={userRoleName} />
      </TabsContent>
      <TabsContent value="room">
        <RoomForm userRoleName={userRoleName} />
      </TabsContent>
      <TabsContent value="slot">
        <SlotForm userRoleName={userRoleName} />
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
