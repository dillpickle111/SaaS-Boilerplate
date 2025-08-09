// scripts/debug-database.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  console.log("🔍 Debugging database connection...");
  
  // Test basic connection
  console.log("Testing basic connection...");
  const { data: testData, error: testError } = await supabase
    .from("question")
    .select("*")
    .limit(1);
  
  console.log("Test query result:", { data: testData, error: testError });
  
  // Try to insert a test category
  console.log("\nTrying to insert a test category...");
  const { data: insertData, error: insertError } = await supabase
    .from("question_category")
    .insert({
      name: "Test Category",
      slug: "test-category",
      description: "Test category for debugging",
      color: "#FF0000"
    })
    .select();
  
  console.log("Insert result:", { data: insertData, error: insertError });
  
  // List all tables (if possible)
  console.log("\nTrying to list tables...");
  try {
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables');
    console.log("Tables:", { data: tables, error: tablesError });
  } catch (err) {
    console.log("Could not list tables:", err);
  }
  
  // Try to get table info
  console.log("\nTrying to get table info...");
  const { data: info, error: infoError } = await supabase
    .from("question_category")
    .select("*");
  
  console.log("Table info:", { data: info, error: infoError });
})();
