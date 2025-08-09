// scripts/check-counts.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  console.log("🔍 Checking database counts and integrity...\n");

  // Check total counts
  console.log("📊 Total Counts:");
  
  const { count: pdfSets } = await supabase
    .from("pdf_set")
    .select("*", { count: "exact", head: true });
  
  console.log(`   📚 PDF Sets: ${pdfSets ?? 0}`);

  const { count: questions } = await supabase
    .from("question")
    .select("*", { count: "exact", head: true });
  
  console.log(`   ❓ Questions: ${questions ?? 0}`);

  // Check per-set question counts
  console.log("\n📋 Per-Set Question Counts:");
  
  const { data: sets } = await supabase
    .from("pdf_set")
    .select("id, label, total_questions");
  
  for (const s of sets ?? []) {
    const { count } = await supabase
      .from("question")
      .select("*", { count: "exact", head: true })
      .eq("pdf_set_id", s.id);
    
    const actualCount = count ?? 0;
    const expectedCount = s.total_questions;
    const status = actualCount === expectedCount ? "✅" : "⚠️";
    const mismatch = actualCount !== expectedCount ? ` (expected ${expectedCount})` : "";
    
    console.log(`   ${status} ${s.label}: ${actualCount}${mismatch}`);
  }

  // Check for duplicates (simplified approach)
  console.log("\n🔍 Duplicate Checks:");
  
  // Get all question_uid values and check for duplicates in JavaScript
  const { data: allQuestions, error: questionsError } = await supabase
    .from("question")
    .select("question_uid, pdf_set_id, question_number");
  
  if (questionsError) {
    console.log(`❌ Error fetching questions for duplicate check: ${questionsError.message}`);
  } else if (allQuestions) {
    // Check for duplicate question_uid
    const uidCounts = new Map<string, number>();
    allQuestions.forEach(q => {
      uidCounts.set(q.question_uid, (uidCounts.get(q.question_uid) || 0) + 1);
    });
    
    const duplicateUids = Array.from(uidCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([uid, _]) => uid);
    
    if (duplicateUids.length > 0) {
      console.log(`   ❌ Found ${duplicateUids.length} duplicate question_uid values`);
      duplicateUids.forEach(uid => console.log(`      - ${uid}`));
    } else {
      console.log("   ✅ No duplicate question_uid found");
    }
    
    // Check for duplicate (pdf_set_id, question_number)
    const numberCounts = new Map<string, number>();
    allQuestions.forEach(q => {
      const key = `${q.pdf_set_id}-${q.question_number}`;
      numberCounts.set(key, (numberCounts.get(key) || 0) + 1);
    });
    
    const duplicateNumbers = Array.from(numberCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([key, _]) => key);
    
    if (duplicateNumbers.length > 0) {
      console.log(`   ❌ Found ${duplicateNumbers.length} duplicate (pdf_set_id, question_number) pairs`);
      duplicateNumbers.forEach(key => {
        const [pdfSetId, questionNumber] = key.split('-');
        console.log(`      - Set ID: ${pdfSetId}, Question: ${questionNumber}`);
      });
    } else {
      console.log("   ✅ No duplicate (pdf_set_id, question_number) found");
    }
  }

  // Check for orphaned questions (no pdf_set)
  console.log("\n🔗 Data Integrity:");
  
  const { data: orphanedQuestions, error: orphanError } = await supabase
    .from("question")
    .select("id, question_uid")
    .is("pdf_set_id", null);
  
  if (orphanError) {
    console.log(`❌ Error checking orphaned questions: ${orphanError.message}`);
  } else if (orphanedQuestions && orphanedQuestions.length > 0) {
    console.log(`   ⚠️  Found ${orphanedQuestions.length} questions without pdf_set_id`);
    for (const orphan of orphanedQuestions.slice(0, 5)) {
      console.log(`      - ${orphan.question_uid}`);
    }
    if (orphanedQuestions.length > 5) {
      console.log(`      ... and ${orphanedQuestions.length - 5} more`);
    }
  } else {
    console.log("   ✅ All questions have valid pdf_set_id");
  }

  // Check for missing required fields
  console.log("\n📝 Data Quality:");
  
  const { data: missingContent, error: contentError } = await supabase
    .from("question")
    .select("id, question_uid")
    .or("content.is.null,content.eq.''");
  
  if (contentError) {
    console.log(`❌ Error checking missing content: ${contentError.message}`);
  } else if (missingContent && missingContent.length > 0) {
    console.log(`   ⚠️  Found ${missingContent.length} questions with missing content`);
  } else {
    console.log("   ✅ All questions have content");
  }

  const { data: missingAnswers, error: answerError } = await supabase
    .from("question")
    .select("id, question_uid")
    .or("correct_answer.is.null,correct_answer.eq.''");
  
  if (answerError) {
    console.log(`❌ Error checking missing answers: ${answerError.message}`);
  } else if (missingAnswers && missingAnswers.length > 0) {
    console.log(`   ⚠️  Found ${missingAnswers.length} questions with missing correct_answer`);
  } else {
    console.log("   ✅ All questions have correct_answer");
  }

  console.log("\n🎉 Count check complete!");
}

run().catch(err => {
  console.error("💥 Count check failed:", err);
  process.exit(1);
});
