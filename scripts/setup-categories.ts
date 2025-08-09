// scripts/setup-categories.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const categories = [
  {
    name: "Math",
    slug: "math",
    description: "Mathematics questions including algebra, geometry, and advanced math",
    color: "#3B82F6"
  },
  {
    name: "Reading",
    slug: "reading", 
    description: "Reading comprehension and analysis questions",
    color: "#10B981"
  },
  {
    name: "Writing",
    slug: "writing",
    description: "Grammar, usage, and writing mechanics questions", 
    color: "#F59E0B"
  }
];

(async () => {
  console.log("Setting up question categories...");
  
  for (const category of categories) {
    const { data, error } = await supabase
      .from("question_category")
      .upsert(category, { onConflict: "slug" });
    
    if (error) {
      console.error(`Error inserting category ${category.name}:`, error.message);
    } else {
      console.log(`✅ Added category: ${category.name}`);
    }
  }
  
  // List all categories
  const { data: existingCategories, error: listError } = await supabase
    .from("question_category")
    .select("*");
    
  if (listError) {
    console.error("Error listing categories:", listError.message);
  } else {
    console.log("\n📋 Current categories:");
    existingCategories?.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat.id}, Slug: ${cat.slug})`);
    });
  }
})();
