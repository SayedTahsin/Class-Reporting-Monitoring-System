# API Permission Requirements

This document lists the required permissions for each API endpoint in the `apps/server/src/routers` folder.

---

## courseRouter
- `getAll`, `getById`, `search`, `searchByCredits`, `filterByCredits`: **No explicit permission** (protected only)
- `delete`: `*` 
- `update`, `create`: `course:create_update`

## permissionRouter
- All endpoints: `*` 

## sectionRouter
- `getAll`, `getById`: **No explicit permission** (protected only)
- `delete`: `*`
- `update`, `create`: `section:create_update`

## classScheduleRouter
- `getAll`, `getByDaySlot`, `getByTeacherId`: **No explicit permission** (protected only)
- `delete`: `*`
- `update`: `class_schedule:update` or fallback to `class_schedule:update_own` (with teacher ownership check)
- `create`: `class_schedule:create`

## slotRouter
- `getAll`, `getById`: **No explicit permission** (protected only)
- `delete`: `*`
- `update`, `create`: `slot:create_update`

## userRouter
- `getAll`, `getStudents`, `getBySection`, `filter`, `update`: `user:filter_update_viewAll` (update allows self-update if not permitted)
- `getTeachers`, `getById`: **No explicit permission** (protected only)
- `delete`: `*`

## classHistoryRouter
- `getAll`, `getByDate`, `getByTeacherId`, `getBySectionId`, `getByCourseId`: **No explicit permission** (protected only)
- `create`: `*` or fallback to `class_history:create` (with teacher ownership check)
- `update`: `class_history:update` or fallback to `class_history:update_own` (with teacher ownership check), then `class_history:update_own_section`
- `delete`: `*`

## roleRouter
- `getAll`, `getById`: **No explicit permission** (protected only)
- `getByName`: **Public**
- `delete`, `update`, `create`: `*`

## roomRouter
- `getAll`, `getById`, `search`: **No explicit permission** (protected only)
- `delete`: `*`
- `update`, `create`: `room:create_update`

## userRoleRouter
- All endpoints: `*`

## rolePermissionRouter
- All endpoints: `*`

---

**Legend:**
- `*` = any permission (admin/superuser)
- **No explicit permission** = only authentication required (protected route)
- Some endpoints have fallback logic for ownership (e.g., update own info/history)
