import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { userRole, permission, rolePermission } from "@/db/schema/pbac";

export async function checkPermission(userId: string, permissionNeeded: string) {
    if (!userId) throw new Error('Not authenticated');
  
    const roles = await db.select().from(userRole).where(eq(userRole.userId, userId));
  
    if (roles.length === 0) throw new Error('No role assigned');
  
    const roleIds = roles.map(role => role.roleId);
  
    const permissions = await db
      .select({ name: permission.name })
      .from(rolePermission)
      .where(inArray(rolePermission.roleId, roleIds))
      .innerJoin(permission, eq(rolePermission.permissionId, permission.id));
  
    const permissionNames = permissions.map(p => p.name);
  
    if (permissionNames.includes('*') || permissionNames.includes(permissionNeeded)) {
      return true;
    }
  
    throw new Error('Forbidden: No Permission');
  }
  