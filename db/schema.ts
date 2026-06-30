import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  date,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

// ── Users ──
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  dateOfBirth: date("date_of_birth"),
  ssnLastFour: varchar("ssn_last_four", { length: 4 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Credit Reports ──
export const creditReports = mysqlTable("credit_reports", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  reportDate: date("report_date").notNull(),
  bureau: mysqlEnum("bureau", ["equifax", "experian", "transunion"])
    .notNull(),
  reportSource: varchar("report_source", { length: 100 }),
  score: int("score"),
  scoreModel: varchar("score_model", { length: 50 }),
  totalAccounts: int("total_accounts").default(0),
  negativeAccounts: int("negative_accounts").default(0),
  inquiries: int("inquiries").default(0),
  publicRecords: int("public_records").default(0),
  totalBalance: decimal("total_balance", { precision: 12, scale: 2 }),
  totalMonthlyPayments: decimal("total_monthly_payments", {
    precision: 12,
    scale: 2,
  }),
  creditUtilization: decimal("credit_utilization", {
    precision: 5,
    scale: 2,
  }),
  oldestAccountDate: date("oldest_account_date"),
  avgAccountAge: int("avg_account_age"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type CreditReport = typeof creditReports.$inferSelect;

// ── Credit Accounts ──
export const creditAccounts = mysqlTable("credit_accounts", {
  id: serial("id").primaryKey(),
  reportId: bigint("report_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => creditReports.id),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountNumber: varchar("account_number", { length: 100 }),
  accountType: mysqlEnum("account_type", [
    "credit_card",
    "mortgage",
    "auto_loan",
    "student_loan",
    "personal_loan",
    "collection",
    "charge_off",
    "inquiry",
    "public_record",
    "other",
  ]).notNull(),
  creditorName: varchar("creditor_name", { length: 255 }),
  originalCreditor: varchar("original_creditor", { length: 255 }),
  bureau: mysqlEnum("bureau", ["equifax", "experian", "transunion"])
    .notNull(),
  dateOpened: date("date_opened"),
  dateClosed: date("date_closed"),
  dateLastPayment: date("date_last_payment"),
  dateFirstDelinquency: date("date_first_delinquency"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }),
  highBalance: decimal("high_balance", { precision: 12, scale: 2 }),
  balance: decimal("balance", { precision: 12, scale: 2 }),
  monthlyPayment: decimal("monthly_payment", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", [
    "open",
    "closed",
    "paid",
    "collection",
    "charged_off",
    "settled",
    "unknown",
  ]).default("unknown"),
  paymentStatus: varchar("payment_status", { length: 100 }),
  isNegative: boolean("is_negative").default(false),
  negativeReason: varchar("negative_reason", { length: 255 }),
  daysLate: int("days_late").default(0),
  isDisputed: boolean("is_disputed").default(false),
  isDeleted: boolean("is_deleted").default(false),
  disputeId: bigint("dispute_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type CreditAccount = typeof creditAccounts.$inferSelect;

// ── Creditors / Data Furnishers ──
export const creditors = mysqlTable("creditors", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  phone: varchar("phone", { length: 50 }),
  fax: varchar("fax", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  isCollectionAgency: boolean("is_collection_agency").default(false),
  originalCreditor: varchar("original_creditor", { length: 255 }),
  accountNumber: varchar("account_number", { length: 100 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Creditor = typeof creditors.$inferSelect;

// ── Disputes ──
export const disputes = mysqlTable("disputes", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  accountId: bigint("account_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => creditAccounts.id),
  creditorId: bigint("creditor_id", { mode: "number", unsigned: true }).references(() => creditors.id),
  bureau: mysqlEnum("bureau", ["equifax", "experian", "transunion"])
    .notNull(),
  roundNumber: int("round_number").default(1).notNull(),
  letterType: mysqlEnum("letter_type", [
    "general",
    "section_609",
    "section_611",
    "section_623",
    "debt_validation",
    "goodwill",
    "pay_for_delete",
    "cease_desist",
  ]).notNull(),
  disputeReason: text("dispute_reason").notNull(),
  disputeMethod: mysqlEnum("dispute_method", [
    "mail",
    "online",
    "phone",
    "fax",
  ])
    .default("mail")
    .notNull(),
  status: mysqlEnum("status", [
    "draft",
    "sent",
    "under_investigation",
    "verified",
    "deleted",
    "updated",
    "reinserted",
    "no_response",
    "closed",
  ])
    .default("draft")
    .notNull(),
  sentDate: date("sent_date"),
  responseDueDate: date("response_due_date"),
  responseDate: date("response_date"),
  responseSummary: text("response_summary"),
  methodOfVerification: text("method_of_verification"),
  isFrivolous: boolean("is_frivolous").default(false),
  frivolousReason: text("frivolous_reason"),
  nextAction: varchar("next_action", { length: 255 }),
  nextActionDate: date("next_action_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Dispute = typeof disputes.$inferSelect;

// ── Dispute Letters ──
export const disputeLetters = mysqlTable("dispute_letters", {
  id: serial("id").primaryKey(),
  disputeId: bigint("dispute_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => disputes.id),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  letterType: mysqlEnum("letter_type", [
    "general",
    "section_609",
    "section_611",
    "section_623",
    "debt_validation",
    "goodwill",
    "pay_for_delete",
    "cease_desist",
  ]).notNull(),
  letterContent: text("letter_content").notNull(),
  recipientName: varchar("recipient_name", { length: 255 }),
  recipientAddress: text("recipient_address"),
  subject: varchar("subject", { length: 255 }),
  isGenerated: boolean("is_generated").default(true),
  isCustomized: boolean("is_customized").default(false),
  isPrinted: boolean("is_printed").default(false),
  isSent: boolean("is_sent").default(false),
  sentVia: mysqlEnum("sent_via", ["certified_mail", "regular_mail", "fax", "email"]),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type DisputeLetter = typeof disputeLetters.$inferSelect;

// ── Credit Scores ──
export const creditScores = mysqlTable("credit_scores", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  reportId: bigint("report_id", { mode: "number", unsigned: true })
    .references(() => creditReports.id),
  bureau: mysqlEnum("bureau", ["equifax", "experian", "transunion"])
    .notNull(),
  score: int("score").notNull(),
  scoreModel: varchar("score_model", { length: 50 }),
  factors: text("factors"),
  dateRecorded: date("date_recorded").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CreditScore = typeof creditScores.$inferSelect;

// ── Activities ──
export const activities = mysqlTable("activities", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  type: mysqlEnum("type", [
    "dispute_created",
    "dispute_sent",
    "dispute_response",
    "dispute_deleted",
    "dispute_updated",
    "letter_generated",
    "letter_sent",
    "score_update",
    "report_imported",
    "account_added",
    "account_updated",
    "reminder",
    "note_added",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  relatedId: bigint("related_id", { mode: "number", unsigned: true }),
  relatedType: varchar("related_type", { length: 50 }),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;

// ── Reminders ──
export const reminders = mysqlTable("reminders", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: date("due_date").notNull(),
  isCompleted: boolean("is_completed").default(false),
  relatedId: bigint("related_id", { mode: "number", unsigned: true }),
  relatedType: varchar("related_type", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Reminder = typeof reminders.$inferSelect;
