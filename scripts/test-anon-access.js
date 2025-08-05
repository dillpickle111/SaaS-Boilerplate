const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAnonAccess() {
  console.log('🧪 Testing anon key access to questions...\n');

  try {
    // Test 1: Count questions
    console.log('1️⃣ Counting questions with anon key...');
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting questions:', countError);
    } else {
      console.log(`✅ Anon key can access ${count} questions`);
    }

    // Test 2: Get sample questions
    console.log('\n2️⃣ Fetching sample questions with anon key...');
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(3);

    if (questionsError) {
      console.error('❌ Error fetching questions:', questionsError);
    } else {
      console.log(`✅ Anon key can fetch ${questions.length} sample questions:`);
      questions.forEach((q, i) => {
        console.log(`   Question ${i + 1}: ${q.question_id} (${q.module}, ${q.difficulty})`);
      });
    }

    // Test 3: Test the exact query from our helper function
    console.log('\n3️⃣ Testing helper function query with anon key...');
    const { data: helperData, error: helperError } = await supabase
      .from('questions')
      .select('module, difficulty, skill_cd')
      .eq('active', true);

    if (helperError) {
      console.error('❌ Error in helper query:', helperError);
    } else {
      console.log(`✅ Helper query with anon key returned ${helperData.length} questions`);
      
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

      console.log('✅ Calculated stats with anon key:', stats);
    }

    if (count > 0) {
      console.log('\n🎉 SUCCESS! Anon key can now access questions. Your frontend should work!');
    } else {
      console.log('\n❌ Still no access. Please run the SQL fix in your Supabase dashboard.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAnonAccess(); 