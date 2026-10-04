import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';

export const consultations = sqliteTable('consultations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  priority: text('priority').notNull(),
  approach: text('approach').notNull(),
  consentVersion: text('consent_version').notNull(),
  createdAt: integer('created_at').notNull(),
});
