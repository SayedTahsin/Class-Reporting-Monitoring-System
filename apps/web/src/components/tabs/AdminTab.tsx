import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ClassScheduleForm from "./ClassScheduleTab"
import CourseForm from "./CourseForm"
import PBACForm from "./PbacForm"
import PermissionForm from "./PermissionForm"
import ReportTab from "./ReportTab"
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
        className={`grid w-full gap-1 ${
          isSuperAdmin
            ? "grid-cols-10"
            : isTeacher
              ? "grid-cols-5"
              : "grid-cols-7"
        }`}
      >
        {(isSuperAdmin || isChairman) && (
          <>
            <TabsTrigger value="user" className="px-2 py-1 text-sm">
              User
            </TabsTrigger>
            <TabsTrigger value="report" className="px-2 py-1 text-sm">
              Report
            </TabsTrigger>
          </>
        )}
        <TabsTrigger value="class_schedule" className="px-2 py-1 text-sm">
          Class Schedule
        </TabsTrigger>
        <TabsTrigger value="section" className="px-2 py-1 text-sm">
          Section
        </TabsTrigger>
        <TabsTrigger value="course" className="px-2 py-1 text-sm">
          Course
        </TabsTrigger>
        <TabsTrigger value="room" className="px-2 py-1 text-sm">
          Room
        </TabsTrigger>
        <TabsTrigger value="slot" className="px-2 py-1 text-sm">
          Slot
        </TabsTrigger>
        {isSuperAdmin && (
          <>
            <TabsTrigger value="role" className="px-2 py-1 text-sm">
              Role
            </TabsTrigger>
            <TabsTrigger value="permission" className="px-2 py-1 text-sm">
              Permission
            </TabsTrigger>
            <TabsTrigger value="pbac" className="px-2 py-1 text-sm">
              PBAC
            </TabsTrigger>
          </>
        )}
      </TabsList>

      {(isSuperAdmin || isChairman) && (
        <>
          <TabsContent value="user">
            <UserForm />
          </TabsContent>
          <TabsContent value="report">
            <ReportTab />
          </TabsContent>
        </>
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
