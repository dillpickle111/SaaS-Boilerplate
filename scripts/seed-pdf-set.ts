// scripts/seed-pdf-set.ts
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SeedPdfSetArgs {
  label: string;
  storagePath: string;
  totalQuestions: number;
  totalPages: number;
  title?: string;
  year?: number;
}

function parseArgs(): SeedPdfSetArgs {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.error("Usage: npx tsx scripts/seed-pdf-set.ts <label> <storage_path> <total_questions> <total_pages> [title] [year]");
    console.error("Example: npx tsx scripts/seed-pdf-set.ts \"SAT-Math-Set-03\" \"data/pdfs/SAT-Math-Set-03.pdf\" 50 18 \"Official Practice Test 8\" 2020");
    process.exit(1);
  }

  return {
    label: args[0],
    storagePath: args[1],
    totalQuestions: parseInt(args[2]),
    totalPages: parseInt(args[3]),
    title: args[4] || args[0],
    year: args[5] ? parseInt(args[5]) : undefined
  };
}

async function createPdfSetJson(args: SeedPdfSetArgs) {
  const dataDir = path.resolve("data/questions");
  const outputFile = path.join(dataDir, `${args.label}.json`);
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Check if PDF file exists
  const pdfPath = path.resolve(args.storagePath);
  if (!fs.existsSync(pdfPath)) {
    console.warn(`⚠️  Warning: PDF file not found at ${pdfPath}`);
    console.warn("   The JSON will be created but you'll need to add the PDF file later.");
  }

  const pdfSetData = {
    pdfSet: {
      label: args.label,
      storage_path: args.storagePath,
      total_questions: args.totalQuestions,
      total_pages: args.totalPages,
      title: args.title,
      year: args.year
    },
    questions: []
  };

  // Create placeholder questions
  for (let i = 1; i <= args.totalQuestions; i++) {
    pdfSetData.questions.push({
      question_number: i,
      title: `Question ${i}`,
      content: `[Question ${i} content will be added here]`,
      options: ["A", "B", "C", "D"],
      correct_answer: "A",
      explanation: `[Explanation for question ${i} will be added here]`,
      section: "Math",
      topic: "Algebra",
      difficulty: "medium",
      pdf_page_from: Math.ceil((i / args.totalQuestions) * args.totalPages),
      pdf_page_to: Math.ceil((i / args.totalQuestions) * args.totalPages),
      question_uid: `${args.label}-Q${i}`
    });
  }

  // Write JSON file
  fs.writeFileSync(outputFile, JSON.stringify(pdfSetData, null, 2));
  
  console.log(`✅ Created JSON file: ${outputFile}`);
  console.log(`📊 Generated ${args.totalQuestions} placeholder questions`);
  console.log(`📄 PDF Set: ${args.label} (${args.totalPages} pages)`);
  
  return outputFile;
}

async function upsertPdfSet(args: SeedPdfSetArgs) {
  console.log(`\n🔄 Upserting PDF set in database...`);
  
  const { data, error } = await supabase
    .from("pdf_set")
    .upsert({
      label: args.label,
      storage_path: args.storagePath,
      total_questions: args.totalQuestions,
      total_pages: args.totalPages,
      source_name: args.title,
      source_year: args.year
    }, { onConflict: "storage_path" })
    .select()
    .single();

  if (error) {
    console.error(`❌ Error upserting PDF set: ${error.message}`);
    return null;
  } else {
    console.log(`✅ PDF set upserted with ID: ${data.id}`);
    return data.id;
  }
}

async function run() {
  console.log("🌱 Seeding PDF set...");
  
  const args = parseArgs();
  
  console.log(`📋 Arguments:`);
  console.log(`   Label: ${args.label}`);
  console.log(`   Storage Path: ${args.storagePath}`);
  console.log(`   Total Questions: ${args.totalQuestions}`);
  console.log(`   Total Pages: ${args.totalPages}`);
  console.log(`   Title: ${args.title}`);
  console.log(`   Year: ${args.year || 'Not specified'}`);

  // Create JSON file
  const jsonFile = await createPdfSetJson(args);
  
  // Upsert to database
  const pdfSetId = await upsertPdfSet(args);
  
  console.log(`\n🎉 PDF set seeding complete!`);
  console.log(`📁 JSON file: ${jsonFile}`);
  if (pdfSetId) {
    console.log(`🗄️  Database ID: ${pdfSetId}`);
  }
  
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Edit ${jsonFile} to add real question content`);
  console.log(`   2. Run: npm run import:json`);
  console.log(`   3. Run: npm run check:counts`);
}

run().catch(err => {
  console.error("💥 PDF set seeding failed:", err);
  process.exit(1);
});
