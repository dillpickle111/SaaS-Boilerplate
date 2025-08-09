// scripts/import-questions.ts
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
const supabase = createClient(url, key);

async function loadFile(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

async function run() {
  const dataDir = path.resolve("data/questions");
  let payload: any[] = [];

  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".json"));
    for (const f of files) payload = payload.concat(await loadFile(path.join(dataDir, f)));
  } else if (fs.existsSync("data/questions.json")) {
    payload = await loadFile("data/questions.json");
  } else {
    throw new Error("No questions found in data/questions or data/questions.json");
  }

  let inserted = 0;
  for (const q of payload) {
    const row = {
      title: q.text || q.title || `Question ${q.id}`,
      content: q.text || q.content || q.question || "",
      options: q.choices || q.options || null,
      correct_answer: q.answer || q.correct_answer || "",
      explanation: q.explanation || null,
      difficulty: q.difficulty ? parseInt(q.difficulty.toString()) : 1,
      tags: q.topic ? [q.topic] : (q.tags || null),
      category_id: 1, // Default category ID - you may need to adjust this
      is_active: true,
    };
    const { error } = await supabase.from("question").upsert(row, { onConflict: "id" });
    if (error) {
      console.error("Row error:", error.message);
    } else {
      inserted++;
    }
  }
  console.log(`✅ Done. Upserted ${inserted} questions.`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
