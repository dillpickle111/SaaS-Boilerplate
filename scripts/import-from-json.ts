// scripts/import-from-json.ts
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Parse command line arguments
const args = process.argv.slice(2);
const isDebugMode = args.includes('--debug');

interface PdfSet {
  label: string;
  storage_path: string;
  total_questions: number;
  total_pages: number;
  source_name?: string;
  source_year?: number;
}

interface Question {
  title?: string;
  content?: string;
  stem?: string;
  text?: string;
  options?: string[];
  correct_answer?: string;
  answer?: string;
  explanation?: string;
  section?: string;
  topic?: string;
  subtopic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  question_number?: number;
  pdf_page_from?: number;
  pdf_page_to?: number;
  question_uid?: string;
  assets?: any;
}

interface QuestionData {
  pdfSet: PdfSet;
  questions: Question[];
}

async function loadFile(filePath: string): Promise<QuestionData> {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function mapDifficulty(difficulty?: string): number {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 1;
    case 'medium': return 2;
    case 'hard': return 3;
    default: return 1;
  }
}

function generateChecksum(content: string, options: string[] | null, correctAnswer: string): string {
  const data = content + JSON.stringify(options) + correctAnswer;
  return crypto.createHash('sha256').update(data).digest('hex');
}

function validateQuestion(question: Question, index: number, filename: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!question.content && !question.stem && !question.text) {
    errors.push("Missing content/stem/text");
  }
  
  if (!question.correct_answer && !question.answer) {
    errors.push("Missing correct_answer/answer");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

async function run() {
  console.log("🚀 Starting JSON import process...");
  if (isDebugMode) {
    console.log("🐛 Debug mode enabled");
  }
  
  const dataDir = path.resolve("data/questions");
  let datasets: QuestionData[] = [];
  const skipped: Array<{file: string, index: number, reason: string}> = [];

  // Load data from files
  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".json"));
    console.log(`📁 Found ${files.length} JSON files in data/questions/`);
    for (const f of files) {
      const filePath = path.join(dataDir, f);
      if (isDebugMode) {
        console.log(`📖 Processing file: ${filePath}`);
      } else {
        console.log(`📖 Loading ${f}...`);
      }
      datasets.push(await loadFile(filePath));
    }
  } else if (fs.existsSync("data/questions.json")) {
    const filePath = "data/questions.json";
    if (isDebugMode) {
      console.log(`📖 Processing file: ${filePath}`);
    } else {
      console.log("📖 Loading data/questions.json...");
    }
    datasets.push(await loadFile(filePath));
  } else {
    throw new Error("No questions found in data/questions or data/questions.json");
  }

  console.log(`📊 Processing ${datasets.length} dataset(s)...`);

  let totalInserted = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const dataset of datasets) {
    const { pdfSet, questions } = dataset;
    
    console.log(`\n📚 Processing PDF Set: ${pdfSet.label}`);
    console.log(`   Storage Path: ${pdfSet.storage_path}`);
    console.log(`   Questions: ${questions.length}`);
    
    // Ensure pdf_set exists with only the specified fields
    const pdfSetPayload = {
      label: pdfSet.label,
      storage_path: pdfSet.storage_path,
      source_name: pdfSet.source_name || null,
      source_year: pdfSet.source_year || null,
      total_questions: pdfSet.total_questions || null,
      total_pages: pdfSet.total_pages || null,
    };
    
    const { data: pdfSetRows, error: upErr } = await supabase
      .from('pdf_set')
      .upsert(pdfSetPayload, { onConflict: 'storage_path' })
      .select('*')
      .limit(1);
      
    if (upErr) {
      console.error(`❌ Error upserting pdf_set: ${upErr.message}`);
      continue;
    }
    
    const pdfSetId = pdfSetRows?.[0]?.id;
    console.log(`✅ PDF Set ID: ${pdfSetId}`);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < questions.length; i++) {
      const item = questions[i];
      const fileName = path.basename(pdfSet.storage_path);
      
      // Debug output for each question
      if (isDebugMode && item) {
        console.log(`  Question ${i + 1}:`, {
          index: i,
          rawKeys: Object.keys(item),
          hasContent: !!(item.content || item.stem || item.text),
          hasAnswer: !!(item.correct_answer || item.answer),
          optionsType: Array.isArray(item.options) ? 'array' : typeof item.options,
          difficultyRaw: item.difficulty
        });
      }
      
      // Enhanced field fallbacks
      const content = item.content || item.stem || item.text || '';
      if (!content) { 
        const reason = 'missing content';
        console.warn(`⚠️  SKIP reason: ${reason} (question ${i + 1})`); 
        skipped.push({ file: fileName, index: i, reason });
        totalSkipped++; 
        continue; 
      }
      
      const correct = item.correct_answer || item.answer || '';
      if (!correct) { 
        const reason = 'missing answer';
        console.warn(`⚠️  SKIP reason: ${reason} (question ${i + 1})`); 
        skipped.push({ file: fileName, index: i, reason });
        totalSkipped++; 
        continue; 
      }

      // Process options with fallbacks
      let options = null;
      if (item.options) {
        if (Array.isArray(item.options)) {
          options = item.options;
        } else if (typeof item.options === 'object') {
          options = Object.values(item.options);
        } else if (typeof item.options === 'string') {
          options = [item.options];
        } else {
          const reason = 'invalid options';
          console.warn(`⚠️  SKIP reason: ${reason} (question ${i + 1})`); 
          skipped.push({ file: fileName, index: i, reason });
          totalSkipped++; 
          continue;
        }
      }

      const qnum = item.question_number ?? (i + 1);
      
      const row = {
        title: item.title || content.slice(0, 60),
        content,
        options,
        correct_answer: correct,
        explanation: item.explanation ?? null,
        section: item.section ?? 'Math',
        topic: item.topic ?? null,
        subtopic: item.subtopic ?? null,
        difficulty: typeof item.difficulty === 'string'
          ? ({ easy:1, medium:2, hard:3 } as any)[item.difficulty.toLowerCase()] ?? 1
          : (Number(item.difficulty) || 1),
        tags: item.tags ?? null,
        pdf_set_id: pdfSetId,
        question_number: qnum,
        pdf_page_from: item.pdf_page_from ?? null,
        pdf_page_to: item.pdf_page_to ?? item.pdf_page_from ?? null,
        source_ref: fileName,
        question_uid: item.question_uid ?? `${pdfSet.label}-Q${qnum}`,
        assets: item.assets ?? null,
        checksum: generateChecksum(content, (options || []) as string[], correct),
        is_active: item.is_active ?? true,
      };

      // Upsert question
      const { error } = await supabase
        .from("question")
        .upsert(row, { onConflict: "question_uid" });

      if (error) {
        console.error(`❌ Error upserting question ${row.question_uid}: ${error.message}`);
        errors++;
      } else {
        // Check if it was inserted or updated
        const { data: existing } = await supabase
          .from("question")
          .select("id")
          .eq("question_uid", row.question_uid)
          .single();

        if (existing) {
          updated++;
        } else {
          inserted++;
        }
      }
    }

    console.log(`   ✅ Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
    
    totalInserted += inserted;
    totalUpdated += updated;
    totalSkipped += skipped;
    totalErrors += errors;
  }

  // Debug: Print skipped rows summary
  if (isDebugMode && skipped.length > 0) {
    console.log(`\n📊 Skipped Rows Summary:`);
    const skippedByReason = skipped.reduce((acc, item) => {
      acc[item.reason] = (acc[item.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(skippedByReason).forEach(([reason, count]) => {
      console.log(`   ${reason}: ${count} rows`);
    });
    
    console.log(`\n📋 Skipped Details:`);
    skipped.forEach(item => {
      console.log(`   ${item.file}:${item.index + 1} - ${item.reason}`);
    });
  }

  console.log(`\n🎉 Import Summary:`);
  console.log(`   📥 Inserted: ${totalInserted}`);
  console.log(`   🔄 Updated: ${totalUpdated}`);
  console.log(`   ⏭️  Skipped: ${totalSkipped}`);
  console.log(`   ❌ Errors: ${totalErrors}`);
  console.log(`   📊 Total Processed: ${totalInserted + totalUpdated + totalSkipped + totalErrors}`);
}

run().catch(err => {
  console.error("💥 Import failed:", err);
  process.exit(1);
});
