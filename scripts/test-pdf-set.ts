// scripts/test-pdf-set.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  console.log("🧪 Testing PDF set insertion...");
  
  // Try different column combinations to see what works
  const testCases = [
    {
      name: "Basic fields",
      data: {
        label: "test-set-1",
        storage_path: "data/pdfs/test.pdf",
        total_questions: 10,
        total_pages: 5
      }
    },
    {
      name: "With title",
      data: {
        label: "test-set-2", 
        storage_path: "data/pdfs/test2.pdf",
        total_questions: 10,
        total_pages: 5,
        title: "Test Set 2"
      }
    },
    {
      name: "With year",
      data: {
        label: "test-set-3",
        storage_path: "data/pdfs/test3.pdf", 
        total_questions: 10,
        total_pages: 5,
        year: 2024
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log(`   Data:`, testCase.data);
    
    try {
      const { data, error } = await supabase
        .from("pdf_set")
        .insert(testCase.data)
        .select();
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Success! Inserted ID: ${data?.[0]?.id}`);
        console.log(`   📊 Returned data:`, data?.[0]);
      }
    } catch (err) {
      console.log(`   ❌ Exception: ${err}`);
    }
  }
  
  // Clean up test data
  console.log("\n🧹 Cleaning up test data...");
  const { error: deleteError } = await supabase
    .from("pdf_set")
    .delete()
    .like("label", "test-set-%");
  
  if (deleteError) {
    console.log(`   ❌ Cleanup error: ${deleteError.message}`);
  } else {
    console.log("   ✅ Test data cleaned up");
  }
})();
