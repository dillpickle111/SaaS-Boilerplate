// scripts/fill-missing-questions.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Parse command line arguments
const args = process.argv.slice(2);
const labelArg = args.find(arg => arg.startsWith('--label='))?.split('=')[1];
const expectedArg = args.find(arg => arg.startsWith('--expected='))?.split('=')[1];

if (!labelArg) {
  console.error("❌ Error: --label argument is required");
  console.log("Usage: npm run fill:missing -- --label=\"SET-LABEL\" --expected=50");
  process.exit(1);
}

const label = labelArg;
const expected = expectedArg ? parseInt(expectedArg) : 50;

async function run() {
  console.log(`🔍 Finding missing questions for ${label} (expected: ${expected})...\n`);

  // Find the pdf_set by label
  const { data: pdfSet, error: pdfSetError } = await supabase
    .from("pdf_set")
    .select("id, label, total_questions")
    .eq("label", label)
    .single();

  if (pdfSetError) {
    console.error(`❌ Error finding PDF set "${label}": ${pdfSetError.message}`);
    process.exit(1);
  }

  if (!pdfSet) {
    console.error(`❌ PDF set "${label}" not found`);
    process.exit(1);
  }

  console.log(`📚 Found PDF Set: ${pdfSet.label} (ID: ${pdfSet.id})`);
  console.log(`   Current total_questions: ${pdfSet.total_questions}`);

  // Get existing question numbers for this set
  const { data: existingQuestions, error: questionsError } = await supabase
    .from("question")
    .select("question_number")
    .eq("pdf_set_id", pdfSet.id)
    .order("question_number");

  if (questionsError) {
    console.error(`❌ Error fetching existing questions: ${questionsError.message}`);
    process.exit(1);
  }

  const existingNumbers = new Set(existingQuestions?.map(q => q.question_number) || []);
  console.log(`   Existing questions: ${existingNumbers.size} (${Array.from(existingNumbers).sort((a, b) => a - b).join(', ')})`);

  // Find missing question numbers
  const missingNumbers: number[] = [];
  for (let i = 1; i <= expected; i++) {
    if (!existingNumbers.has(i)) {
      missingNumbers.push(i);
    }
  }

  console.log(`   Missing questions: ${missingNumbers.length} (${missingNumbers.join(', ')})`);

  if (missingNumbers.length === 0) {
    console.log("✅ No missing questions to add!");
    return;
  }

  // Add placeholder questions for missing numbers
  let inserted = 0;
  let updated = 0;

  for (const questionNumber of missingNumbers) {
    const placeholderQuestion = {
      title: `${label}-Q${questionNumber.toString().padStart(2, '0')} (placeholder)`,
      content: "",
      correct_answer: "",
      options: null,
      explanation: null,
      section: "Math",
      topic: null,
      subtopic: null,
      difficulty: 1,
      tags: null,
      pdf_set_id: pdfSet.id,
      question_number: questionNumber,
      pdf_page_from: null,
      pdf_page_to: null,
      source_ref: `${label}.pdf`,
      question_uid: `${label}-Q${questionNumber.toString().padStart(2, '0')}`,
      assets: null,
      checksum: "", // Empty checksum for placeholder
      is_active: true,
    };

    const { error } = await supabase
      .from("question")
      .upsert(placeholderQuestion, { onConflict: "question_uid" });

    if (error) {
      console.error(`❌ Error upserting question ${questionNumber}: ${error.message}`);
    } else {
      // Check if it was inserted or updated
      const { data: existing } = await supabase
        .from("question")
        .select("id")
        .eq("question_uid", placeholderQuestion.question_uid)
        .single();

      if (existing) {
        updated++;
      } else {
        inserted++;
      }
    }
  }

  console.log(`\n✅ Summary:`);
  console.log(`   📥 Inserted: ${inserted}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   📊 Total processed: ${inserted + updated}`);

  // Update the pdf_set total_questions if needed
  if (pdfSet.total_questions !== expected) {
    const { error: updateError } = await supabase
      .from("pdf_set")
      .update({ total_questions: expected })
      .eq("id", pdfSet.id);

    if (updateError) {
      console.error(`❌ Error updating total_questions: ${updateError.message}`);
    } else {
      console.log(`   📝 Updated pdf_set total_questions to ${expected}`);
    }
  }
}

run().catch(err => {
  console.error("💥 Script failed:", err);
  process.exit(1);
});
