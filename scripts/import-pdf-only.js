const fs = require('node:fs');
const path = require('node:path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please add to your .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (for import)');
  process.exit(1);
}

// Use service role key for import (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// JSON path (new extractor output)
const JSON_PATH = path.join(__dirname, 'data/import-ready-questions.json');

/**
 * Parse PDF-extracted questions
 */
function loadQuestions() {
  if (!fs.existsSync(JSON_PATH)) {
    throw new Error(`JSON not found at ${JSON_PATH}`);
  }
  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  if (!Array.isArray(data)) throw new Error('JSON is not an array');
  return data;
}

function toPayload(item) {
  return {
    id: item.id,
    assessment: item.assessment,
    test: item.test,
    domain: item.domain,
    skill: item.skill,
    difficulty: item.difficulty,
    number: item.number ?? null,
    stem: item.stem ?? '',
    choices: item.choices ?? null,
    answer: item.answer ?? null,
    rationale: item.rationale ?? null,
    images: item.images ?? [],
    pages: item.pages ?? [],
  };
}

/**
 * Import questions to Supabase
 */
async function importQuestionsToSupabase(items) {
  console.log(`📤 Upserting ${items.length} questions by id...`);
  
  const batchSize = 1000;
  let insertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    console.log(`📤 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}...`);
    
    const { data, error } = await supabase
      .from('questions')
      .upsert(batch, { onConflict: 'id' });

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
async function importPDFQuestions() {
  try {
    console.log('🚀 Starting JSON import (id upsert)...');
    const items = loadQuestions();
    if (items.length === 0) {
      console.error('❌ No items in JSON file!');
      process.exit(1);
    }

    const payloads = items.map(toPayload);
    const { insertedCount, errorCount } = await importQuestionsToSupabase(payloads);
    
    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully imported: ${insertedCount} questions`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount} questions`);
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
importPDFQuestions(); 