import { boolean, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const toolReleases = pgTable("tool_releases", {
  slug: text("slug").primaryKey(),
  version: text("version"),
  published: text("published"),
  url: text("url"),
  source: text("source"),
  checkedAt: timestamp("checked_at", { withTimezone: true }).defaultNow().notNull(),
});

export const savedTools = pgTable("saved_tools", {
  visitor: uuid("visitor").notNull(),
  slug: text("slug").notNull(),
  saved: boolean("saved").default(true).notNull(),
  savedAt: timestamp("saved_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.visitor, table.slug] })]);
