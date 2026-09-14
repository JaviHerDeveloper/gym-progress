import { index, numeric, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users.js';

export const bodyWeightEntries = pgTable(
  'body_weight_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    weightKg: numeric('weight_kg', { precision: 6, scale: 2 }).notNull(),
    measuredAt: timestamp('measured_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('body_weight_entries_user_id_measured_at_idx').on(table.userId, table.measuredAt)],
);
