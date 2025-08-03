CREATE TABLE IF NOT EXISTS "practice_session" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category_id" integer,
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "question_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session_question" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"user_answer" text,
	"is_correct" boolean,
	"time_spent" integer,
	"order_index" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"question_id" integer NOT NULL,
	"is_correct" boolean NOT NULL,
	"time_spent" integer,
	"selected_answer" text,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "practice_session" ADD CONSTRAINT "practice_session_category_id_question_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."question_category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question" ADD CONSTRAINT "question_category_id_question_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."question_category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_question" ADD CONSTRAINT "session_question_session_id_practice_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."practice_session"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_question" ADD CONSTRAINT "session_question_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "practice_session_user_id_idx" ON "practice_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "practice_session_category_id_idx" ON "practice_session" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "practice_session_started_at_idx" ON "practice_session" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_category_id_idx" ON "question" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_difficulty_idx" ON "question" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_is_active_idx" ON "question" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_question_session_id_idx" ON "session_question" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_question_question_id_idx" ON "session_question" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_question_order_idx" ON "session_question" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_progress_user_id_idx" ON "user_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_progress_question_id_idx" ON "user_progress" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_progress_user_question_idx" ON "user_progress" USING btree ("user_id","question_id");