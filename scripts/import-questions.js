const fs = require('fs');
const path = require('path');
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

// Path to the OnePrep questions JSON file
const questionsPath = path.join(__dirname, '../../sat-question-bank-analysis/data/cb-digital-questions.json');

async function importQuestions() {
  try {
    console.log('📖 Reading questions from OnePrep repository...');
    
    if (!fs.existsSync(questionsPath)) {
      console.error('❌ Questions file not found. Please clone the OnePrep repository first:');
      console.log('git clone https://github.com/mdn522/sat-question-bank.git sat-question-bank-analysis');
      process.exit(1);
    }

    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    console.log(`📊 Found ${Object.keys(questionsData).length} questions`);

    // Transform questions to our format
    const transformedQuestions = Object.entries(questionsData).map(([id, question]) => {
      // Extract content from the OnePrep format
      const content = {
        keys: question.content?.keys || [],
        rationale: question.content?.rationale || '',
        question: question.content?.question || '',
        options: question.content?.options || [],
        correct_answer: question.content?.correct_answer || '',
        explanation: question.content?.explanation || ''
      };

      // Map difficulty levels
      const difficultyMap = {
        'E': 'E', // Easy
        'M': 'M', // Medium  
        'H': 'H'  // Hard
      };

      // Map modules
      const moduleMap = {
        'math': 'math',
        'reading': 'reading', 
        'writing': 'writing'
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
        content: content,
        program: question.program || 'SAT',
        score_band_range_cd: question.score_band_range_cd || 5,
        active: true
      };
    });

    console.log('🔄 Transforming questions...');
    console.log(`📝 Transformed ${transformedQuestions.length} questions`);

    // Batch insert questions (Supabase has a limit of 1000 per batch)
    const batchSize = 1000;
    let insertedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < transformedQuestions.length; i += batchSize) {
      const batch = transformedQuestions.slice(i, i + batchSize);
      
      console.log(`📤 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transformedQuestions.length / batchSize)}...`);
      
      const { data, error } = await supabase
        .from('questions')
        .upsert(batch, { 
          onConflict: 'question_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('❌ Error inserting batch:', error);
        errorCount += batch.length;
      } else {
        insertedCount += data?.length || batch.length;
        console.log(`✅ Inserted ${data?.length || batch.length} questions`);
      }
    }

    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully imported: ${insertedCount} questions`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount} questions`);
    }

    // Get some statistics
    const { data: stats } = await supabase
      .from('questions')
      .select('module, difficulty')
      .eq('active', true);

    if (stats) {
      const moduleStats = {};
      const difficultyStats = {};
      
      stats.forEach(q => {
        moduleStats[q.module] = (moduleStats[q.module] || 0) + 1;
        difficultyStats[q.difficulty] = (difficultyStats[q.difficulty] || 0) + 1;
      });

      console.log('\n📊 Import Statistics:');
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