// scripts/setup-database.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const setupSQL = `
-- Create question categories table
CREATE TABLE IF NOT EXISTS "question_category" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "description" text,
  "color" text,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create questions table
CREATE TABLE IF NOT EXISTS "question" (
  "id" serial PRIMARY KEY NOT NULL,
  "category_id" integer NOT NULL REFERENCES "question_category"("id"),
  "title" text NOT NULL,
  "content" text NOT NULL,
  "options" json,
  "correct_answer" text NOT NULL,
  "explanation" text,
  "difficulty" integer DEFAULT 1 NOT NULL,
  "tags" json,
  "is_active" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create user progress table
CREATE TABLE IF NOT EXISTS "user_progress" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "question_id" integer NOT NULL REFERENCES "question"("id"),
  "is_correct" boolean NOT NULL,
  "time_spent" integer,
  "selected_answer" text,
  "completed_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create practice sessions table
CREATE TABLE IF NOT EXISTS "practice_session" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "category_id" integer REFERENCES "question_category"("id"),
  "session_type" text NOT NULL,
  "question_count" integer NOT NULL,
  "correct_answers" integer DEFAULT 0 NOT NULL,
  "total_time" integer,
  "score" integer,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create session questions table
CREATE TABLE IF NOT EXISTS "session_question" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_id" integer NOT NULL REFERENCES "practice_session"("id"),
  "question_id" integer NOT NULL REFERENCES "question"("id"),
  "user_answer" text,
  "is_correct" boolean,
  "time_spent" integer,
  "order_index" integer NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "question_category_id_idx" ON "question" ("category_id");
CREATE INDEX IF NOT EXISTS "question_difficulty_idx" ON "question" ("difficulty");
CREATE INDEX IF NOT EXISTS "question_is_active_idx" ON "question" ("is_active");
CREATE INDEX IF NOT EXISTS "user_progress_user_id_idx" ON "user_progress" ("user_id");
CREATE INDEX IF NOT EXISTS "user_progress_question_id_idx" ON "user_progress" ("question_id");
CREATE INDEX IF NOT EXISTS "practice_session_user_id_idx" ON "practice_session" ("user_id");
CREATE INDEX IF NOT EXISTS "practice_session_category_id_idx" ON "practice_session" ("category_id");
CREATE INDEX IF NOT EXISTS "session_question_session_id_idx" ON "session_question" ("session_id");
CREATE INDEX IF NOT EXISTS "session_question_question_id_idx" ON "session_question" ("question_id");
CREATE INDEX IF NOT EXISTS "session_question_order_idx" ON "session_question" ("order_index");

-- Create unique constraint for user progress
CREATE UNIQUE INDEX IF NOT EXISTS "user_progress_user_question_idx" ON "user_progress" ("user_id", "question_id");
`;

(async () => {
  console.log("Setting up database tables...");
  
  const { error } = await supabase.rpc('exec_sql', { sql: setupSQL });
  
  if (error) {
    console.error("Error setting up database:", error.message);
    console.log("\nTrying alternative approach...");
    
    // Try running the SQL directly
    const { error: directError } = await supabase.from('_dummy').select('*').limit(1);
    console.log("Direct query test:", directError ? "Failed" : "Success");
  } else {
    console.log("✅ Database tables created successfully!");
  }
  
  // Test if tables exist
  const { data: categories, error: catError } = await supabase
    .from("question_category")
    .select("count", { count: "exact", head: true });
    
  if (catError) {
    console.log("❌ question_category table doesn't exist yet");
    console.log("You may need to run the SQL manually in your Supabase dashboard");
  } else {
    console.log("✅ question_category table exists");
  }
})();
