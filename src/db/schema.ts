import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  schemaJson: jsonb("schema_json").notNull(),
  version: integer("version").default(1).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  formId: integer("form_id"),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  role: varchar("role", { length: 16 }).notNull(),
  content: text("content").notNull(),
  toolName: varchar("tool_name", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
});
