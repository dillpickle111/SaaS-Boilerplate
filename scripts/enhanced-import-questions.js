const fs = require('node:fs');
const path = require('node:path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please add to your .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (for import)');
  process.exit(1);
}

// Use service role key for import (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// Multiple source paths
const SOURCES = {
  oneprep: path.join(__dirname, '../../sat-question-bank-analysis/data/cb-digital-questions.json'),
  bluebook: path.join(__dirname, 'data/bluebook-questions.json'),
  custom: path.join(__dirname, 'data/custom-questions.json'),
  pdf: path.join(__dirname, 'data/import-ready-questions.json'),
};

/**
 * Parse OnePrep format questions
 */
function parseOnePrepQuestions(data) {
  console.log('🔄 Parsing OnePrep format...');

  return Object.entries(data).map(([id, question]) => {
    // Extract content from the OnePrep format
    const content = {
      keys: question.content?.keys || [],
      rationale: question.content?.rationale || '',
      question: question.content?.question || '',
      options: question.content?.options || [],
      correct_answer: question.content?.correct_answer || '',
      explanation: question.content?.explanation || '',
    };

    // Map difficulty levels
    const difficultyMap = {
      E: 'E', // Easy
      M: 'M', // Medium
      H: 'H', // Hard
    };

    // Map modules
    const moduleMap = {
      math: 'math',
      reading: 'reading',
      writing: 'writing',
    };

    return {
      question_id: question.questionId || id,
      external_id: question.external_id || null,
      skill_cd: question.skill_cd || '',
      skill_desc: question.skill_desc || '',
      primary_class_cd: question.primary_class_cd || '',
      primary_class_cd_desc: question.primary_class_cd_desc || '',
      difficulty: difficultyMap[question.difficulty] || 'M',
      module: moduleMap[question.module] || 'math',
      content,
      program: question.program || 'SAT',
      score_band_range_cd: question.score_band_range_cd || 5,
      active: true,
    };
  });
}

/**
 * Parse Bluebook format questions (CSV/JSON)
 */
function parseBluebookQuestions(data) {
  console.log('🔄 Parsing Bluebook format...');

  // Handle both array and object formats
  const questions = Array.isArray(data) ? data : Object.values(data);

  return questions.map((question, index) => {
    return {
      question_id: question.id || `bluebook-${index}`,
      external_id: question.external_id || null,
      skill_cd: question.skill_cd || '',
      skill_desc: question.skill_desc || '',
      primary_class_cd: question.primary_class_cd || '',
      primary_class_cd_desc: question.primary_class_cd_desc || '',
      difficulty: question.difficulty || 'M',
      module: question.module || 'math',
      content: {
        keys: question.keys || [],
        rationale: question.rationale || '',
        question: question.question || question.content || '',
        options: question.options || question.choices || [],
        correct_answer: question.correct_answer || question.answer || '',
        explanation: question.explanation || '',
      },
      program: question.program || 'SAT',
      score_band_range_cd: question.score_band_range_cd || 5,
      active: true,
    };
  });
}

/**
 * Parse custom format questions
 */
function parseCustomQuestions(data) {
  console.log('🔄 Parsing custom format...');

  const questions = Array.isArray(data) ? data : Object.values(data);

  return questions.map((question, index) => {
    return {
      question_id: question.id || `custom-${index}`,
      external_id: question.external_id || null,
      skill_cd: question.skill_cd || '',
      skill_desc: question.skill_desc || '',
      primary_class_cd: question.primary_class_cd || '',
      primary_class_cd_desc: question.primary_class_cd_desc || '',
      difficulty: question.difficulty || 'M',
      module: question.module || 'math',
      content: {
        keys: question.keys || [],
        rationale: question.rationale || '',
        question: question.question || question.content || '',
        options: question.options || question.choices || [],
        correct_answer: question.correct_answer || question.answer || '',
        explanation: question.explanation || '',
      },
      program: question.program || 'SAT',
      score_band_range_cd: question.score_band_range_cd || 5,
      active: true,
    };
  });
}

/**
 * Parse PDF-extracted questions (new format)
 */
function parsePDFQuestions(data) {
  console.log('🔄 Parsing PDF-extracted questions...');

  const questions = Array.isArray(data) ? data : Object.values(data);

  return questions
    .map((q, index) => {
      const options = Array.isArray(q?.content?.options) ? q.content.options.slice(0, 4) : [];
      const correct = typeof q?.content?.correct_answer === 'string' ? q.content.correct_answer : '';
      return {
        question_id: q.question_id || `pdf-${index}`,
        external_id: q.external_id || null,
        skill_cd: q.skill_cd || '',
        skill_desc: q.skill_desc || '',
        primary_class_cd: q.primary_class_cd || '',
        primary_class_cd_desc: q.primary_class_cd_desc || '',
        difficulty: q.difficulty || 'M',
        module: q.module || 'math',
        content: {
          keys: options,
          rationale: q.content?.rationale || q.content?.explanation || '',
          question: q.content?.question || '',
          options,
          correct_answer: correct || options[0] || '',
          explanation: q.content?.explanation || q.content?.rationale || '',
        },
        program: q.program || 'SAT',
        score_band_range_cd: q.score_band_range_cd || 3,
        active: q.active !== false,
      };
    })
    .filter(q => q.content?.question && q.content.options?.length === 4);
}

/**
 * Import questions to Supabase
 */
async function importQuestionsToSupabase(questions, sourceName) {
  console.log(`📤 Importing ${questions.length} questions from ${sourceName}...`);

  const batchSize = 1000;
  let insertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);

    console.log(`📤 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(questions.length / batchSize)}...`);

    const { data, error } = await supabase
      .from('questions')
      .upsert(batch, {
        onConflict: 'question_id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('❌ Error inserting batch:', error);
      errorCount += batch.length;
    } else {
      insertedCount += data?.length || batch.length;
      console.log(`✅ Inserted ${data?.length || batch.length} questions`);
    }
  }

  return { insertedCount, errorCount };
}

/**
 * Main import function
 */
async function importQuestions() {
  try {
    console.log('🚀 Starting enhanced question import...');

    const allQuestions = [];
    let totalInserted = 0;
    let totalErrors = 0;

    // Try PDF-extracted questions first (new format)
    if (fs.existsSync(SOURCES.pdf)) {
      console.log('📖 Found PDF-extracted questions, importing...');
      const pdfData = JSON.parse(fs.readFileSync(SOURCES.pdf, 'utf8'));
      const pdfQuestions = parsePDFQuestions(pdfData);
      allQuestions.push(...pdfQuestions);
      console.log(`✅ Parsed ${pdfQuestions.length} PDF-extracted questions`);
    } else {
      console.log('⚠️  PDF-extracted questions not found. Run: node scripts/pdf-question-extractor.js <pdf-directory>');
    }

    // Try OnePrep source
    if (fs.existsSync(SOURCES.oneprep)) {
      console.log('📖 Found OnePrep questions, importing...');
      const oneprepData = JSON.parse(fs.readFileSync(SOURCES.oneprep, 'utf8'));
      const oneprepQuestions = parseOnePrepQuestions(oneprepData);
      allQuestions.push(...oneprepQuestions);
      console.log(`✅ Parsed ${oneprepQuestions.length} OnePrep questions`);
    } else {
      console.log('⚠️  OnePrep questions not found. Run: git clone https://github.com/mdn522/sat-question-bank.git sat-question-bank-analysis');
    }

    // Try Bluebook source
    if (fs.existsSync(SOURCES.bluebook)) {
      console.log('📖 Found Bluebook questions, importing...');
      const bluebookData = JSON.parse(fs.readFileSync(SOURCES.bluebook, 'utf8'));
      const bluebookQuestions = parseBluebookQuestions(bluebookData);
      allQuestions.push(...bluebookQuestions);
      console.log(`✅ Parsed ${bluebookQuestions.length} Bluebook questions`);
    }

    // Try custom source
    if (fs.existsSync(SOURCES.custom)) {
      console.log('📖 Found custom questions, importing...');
      const customData = JSON.parse(fs.readFileSync(SOURCES.custom, 'utf8'));
      const customQuestions = parseCustomQuestions(customData);
      allQuestions.push(...customQuestions);
      console.log(`✅ Parsed ${customQuestions.length} custom questions`);
    }

    if (allQuestions.length === 0) {
      console.error('❌ No questions found in any source!');
      console.log('Available sources:');
      console.log('1. PDF: node scripts/pdf-question-extractor.js <pdf-directory>');
      console.log('2. OnePrep: git clone https://github.com/mdn522/sat-question-bank.git sat-question-bank-analysis');
      console.log('3. Bluebook: Place bluebook-questions.json in scripts/data/');
      console.log('4. Custom: Place custom-questions.json in scripts/data/');
      process.exit(1);
    }

    console.log(`📊 Total questions to import: ${allQuestions.length}`);

    // Import to Supabase
    const { insertedCount, errorCount } = await importQuestionsToSupabase(allQuestions, 'combined');
    totalInserted += insertedCount;
    totalErrors += errorCount;

    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully imported: ${totalInserted} questions`);
    if (totalErrors > 0) {
      console.log(`❌ Errors: ${totalErrors} questions`);
    }

    // Get statistics
    const { data: stats } = await supabase
      .from('questions')
      .select('module, difficulty')
      .eq('active', true);

    if (stats) {
      const moduleStats = {};
      const difficultyStats = {};

      stats.forEach((q) => {
        moduleStats[q.module] = (moduleStats[q.module] || 0) + 1;
        difficultyStats[q.difficulty] = (difficultyStats[q.difficulty] || 0) + 1;
      });

      console.log('\n📊 Final Statistics:');
      console.log('By Module:');
      Object.entries(moduleStats).forEach(([module, count]) => {
        console.log(`  ${module}: ${count} questions`);
      });

      console.log('By Difficulty:');
      Object.entries(difficultyStats).forEach(([difficulty, count]) => {
        console.log(`  ${difficulty}: ${count} questions`);
      });
    }
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importQuestions();
