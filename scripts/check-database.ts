// scripts/check-database.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  console.log("🔍 Checking database structure...");
  
  // Test different table names to see what exists
  const tables = [
    "question",
    "questions", 
    "question_category",
    "user_progress",
    "practice_session"
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("count", { count: "exact", head: true });
      
      if (error) {
        console.log(`❌ Table '${table}' does not exist`);
      } else {
        console.log(`✅ Table '${table}' exists with ${data?.length ?? 0} rows`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}' does not exist`);
    }
  }
  
  console.log("\n📋 Next Steps:");
  console.log("1. Go to your Supabase dashboard");
  console.log("2. Navigate to SQL Editor");
  console.log("3. Run the SQL from migrations/0001_natural_mastermind.sql");
  console.log("4. Then run: npx tsx scripts/setup-categories.ts");
  console.log("5. Finally run: npx tsx scripts/import-questions.ts");
})();
