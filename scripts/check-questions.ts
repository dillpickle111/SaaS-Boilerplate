// scripts/check-questions.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  const { data, error } = await supabase.from("question").select("id", { count: "exact", head: true });
  if (error) throw error;
  console.log(`Questions count: ${data?.length ?? 0}`);
})();
