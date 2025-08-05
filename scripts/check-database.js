const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('🔍 Checking Supabase database...\n');

  try {
    // Check 1: Count total questions
    console.log('1️⃣ Counting total questions...');
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting questions:', countError);
    } else {
      console.log(`✅ Total questions in database: ${count}`);
    }

    // Check 2: Get a few sample questions
    console.log('\n2️⃣ Fetching sample questions...');
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(3);

    if (questionsError) {
      console.error('❌ Error fetching questions:', questionsError);
    } else {
      console.log(`✅ Found ${questions.length} sample questions:`);
      questions.forEach((q, i) => {
        console.log(`   Question ${i + 1}:`);
        console.log(`     ID: ${q.id}`);
        console.log(`     Question ID: ${q.question_id}`);
        console.log(`     Module: ${q.module}`);
        console.log(`     Difficulty: ${q.difficulty}`);
        console.log(`     Has content: ${!!q.content}`);
        console.log(`     Content keys: ${q.content ? Object.keys(q.content).join(', ') : 'none'}`);
        console.log('');
      });
    }

    // Check 3: Check by module
    console.log('3️⃣ Checking questions by module...');
    const { data: moduleData, error: moduleError } = await supabase
      .from('questions')
      .select('module')
      .eq('active', true);

    if (moduleError) {
      console.error('❌ Error checking modules:', moduleError);
    } else {
      const moduleCounts = {};
      moduleData.forEach(q => {
        moduleCounts[q.module] = (moduleCounts[q.module] || 0) + 1;
      });
      console.log('✅ Questions by module:', moduleCounts);
    }

    // Check 4: Check by difficulty
    console.log('\n4️⃣ Checking questions by difficulty...');
    const { data: difficultyData, error: difficultyError } = await supabase
      .from('questions')
      .select('difficulty')
      .eq('active', true);

    if (difficultyError) {
      console.error('❌ Error checking difficulties:', difficultyError);
    } else {
      const difficultyCounts = {};
      difficultyData.forEach(q => {
        difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1;
      });
      console.log('✅ Questions by difficulty:', difficultyCounts);
    }

    // Check 5: Test the exact query from our helper function
    console.log('\n5️⃣ Testing helper function query...');
    const { data: helperData, error: helperError } = await supabase
      .from('questions')
      .select('module, difficulty, skill_cd')
      .eq('active', true);

    if (helperError) {
      console.error('❌ Error in helper query:', helperError);
    } else {
      console.log(`✅ Helper query returned ${helperData.length} questions`);
      
      const stats = {
        total: helperData.length,
        byModule: {},
        byDifficulty: {},
        bySkill: {}
      };

      helperData.forEach(question => {
        stats.byModule[question.module] = (stats.byModule[question.module] || 0) + 1;
        stats.byDifficulty[question.difficulty] = (stats.byDifficulty[question.difficulty] || 0) + 1;
        stats.bySkill[question.skill_cd] = (stats.bySkill[question.skill_cd] || 0) + 1;
      });

      console.log('✅ Calculated stats:', stats);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDatabase(); 