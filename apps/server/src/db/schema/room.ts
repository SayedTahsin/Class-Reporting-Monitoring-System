import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@/lib/helpers/createId';
import { auditColumns } from './audit_column';

export const room = sqliteTable('room', {
  id: text('id').primaryKey().$defaultFn(createId),
  name: text('name').unique().notNull(),

  ...auditColumns

});
