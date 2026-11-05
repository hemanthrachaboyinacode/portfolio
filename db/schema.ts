// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const content = sqliteTable('content', { id: text('id').primaryKey(), value: text('value').notNull() });
export const sessions = sqliteTable('sessions', { id: text('id').primaryKey(), expires: integer('expires').notNull() });
export const attempts = sqliteTable('attempts', { id: text('id').primaryKey(), count: integer('count').notNull(), expires: integer('expires').notNull() });
