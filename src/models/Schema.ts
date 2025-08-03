import {
  bigint,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  integer,
  boolean,
  json,
  index,
} from 'drizzle-orm/pg-core';

// Prepify Database Schema - SAT Question Bank
// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

export const organizationSchema = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
    stripeSubscriptionStatus: text('stripe_subscription_status'),
    stripeSubscriptionCurrentPeriodEnd: bigint(
      'stripe_subscription_current_period_end',
      { mode: 'number' },
    ),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
        table.stripeCustomerId,
      ),
    };
  },
);

// SAT Question Categories (Math, Reading, Writing)
export const questionCategorySchema = pgTable('question_category', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // e.g., "Math", "Reading", "Writing"
  slug: text('slug').notNull().unique(), // e.g., "math", "reading", "writing"
  description: text('description'),
  color: text('color'), // hex color for UI
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// SAT Questions
export const questionSchema = pgTable('question', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => questionCategorySchema.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(), // The actual question text
  options: json('options').$type<string[]>(), // Multiple choice options
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation'), // Explanation of the correct answer
  difficulty: integer('difficulty').notNull().default(1), // 1-5 scale
  tags: json('tags').$type<string[]>(), // Additional tags for filtering
  isActive: boolean('is_active').notNull().default(true),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return {
    categoryIdIdx: index('question_category_id_idx').on(table.categoryId),
    difficultyIdx: index('question_difficulty_idx').on(table.difficulty),
    isActiveIdx: index('question_is_active_idx').on(table.isActive),
  };
});

// User Progress Tracking
export const userProgressSchema = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // Clerk user ID
  questionId: integer('question_id').references(() => questionSchema.id).notNull(),
  isCorrect: boolean('is_correct').notNull(),
  timeSpent: integer('time_spent'), // Time spent in seconds
  selectedAnswer: text('selected_answer'),
  completedAt: timestamp('completed_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('user_progress_user_id_idx').on(table.userId),
    questionIdIdx: index('user_progress_question_id_idx').on(table.questionId),
    userIdQuestionIdIdx: uniqueIndex('user_progress_user_question_idx').on(
      table.userId,
      table.questionId,
    ),
  };
});

// Practice Sessions
export const practiceSessionSchema = pgTable('practice_session', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // Clerk user ID
  categoryId: integer('category_id').references(() => questionCategorySchema.id),
  sessionType: text('session_type').notNull(), // "practice", "quiz", "timed"
  questionCount: integer('question_count').notNull(),
  correctAnswers: integer('correct_answers').notNull().default(0),
  totalTime: integer('total_time'), // Total time in seconds
  score: integer('score'), // Percentage score
  startedAt: timestamp('started_at', { mode: 'date' }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('practice_session_user_id_idx').on(table.userId),
    categoryIdIdx: index('practice_session_category_id_idx').on(table.categoryId),
    startedAtIdx: index('practice_session_started_at_idx').on(table.startedAt),
  };
});

// Session Questions (many-to-many relationship)
export const sessionQuestionSchema = pgTable('session_question', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => practiceSessionSchema.id).notNull(),
  questionId: integer('question_id').references(() => questionSchema.id).notNull(),
  userAnswer: text('user_answer'),
  isCorrect: boolean('is_correct'),
  timeSpent: integer('time_spent'), // Time spent on this question in seconds
  orderIndex: integer('order_index').notNull(), // Order in the session
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return {
    sessionIdIdx: index('session_question_session_id_idx').on(table.sessionId),
    questionIdIdx: index('session_question_question_id_idx').on(table.questionId),
    orderIndexIdx: index('session_question_order_idx').on(table.orderIndex),
  };
});

// Legacy todo schema (keeping for compatibility)
export const todoSchema = pgTable('todo', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
