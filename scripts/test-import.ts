// scripts/test-import.ts
import fs from "node:fs";
import path from "node:path";

async function loadFile(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

async function run() {
  const dataDir = path.resolve("data/questions");
  let payload: any[] = [];

  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".json"));
    console.log(`Found ${files.length} JSON files in data/questions/`);
    for (const f of files) {
      console.log(`Loading ${f}...`);
      payload = payload.concat(await loadFile(path.join(dataDir, f)));
    }
  } else if (fs.existsSync("data/questions.json")) {
    console.log("Loading data/questions.json...");
    payload = await loadFile("data/questions.json");
  } else {
    throw new Error("No questions found in data/questions or data/questions.json");
  }

  console.log(`✅ Loaded ${payload.length} questions from JSON files`);
  console.log("Sample question:", payload[0]);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
