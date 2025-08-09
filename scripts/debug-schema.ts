// scripts/debug-schema.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  console.log("🔍 Debugging database schema...");
  
  // Test different table names and see what exists
  const tables = [
    "pdf_set",
    "question", 
    "question_category",
    "user_progress",
    "practice_session"
  ];
  
  for (const table of tables) {
    console.log(`\n📋 Testing table: ${table}`);
    
    try {
      // Try to select a single row to see what columns exist
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .limit(1);
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Table exists`);
        if (data && data.length > 0) {
          console.log(`   📊 Sample columns: ${Object.keys(data[0]).join(", ")}`);
        } else {
          console.log(`   📊 Table is empty`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Table doesn't exist: ${err}`);
    }
  }
  
  // Try to get table info from information_schema
  console.log("\n🔍 Checking information_schema...");
  try {
    const { data: columns, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'pdf_set' });
    
    if (schemaError) {
      console.log(`   ❌ Schema error: ${schemaError.message}`);
    } else {
      console.log(`   ✅ Schema info:`, columns);
    }
  } catch (err) {
    console.log(`   ❌ Could not get schema info: ${err}`);
  }
})();
