const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testImport() {
  try {
    console.log('🧪 Testing SAT question import...');
    
    // Test 1: Check if questions table exists
    console.log('1. Checking questions table...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('questions')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Questions table not found or inaccessible');
      console.error('Error:', tableError.message);
      return false;
    }
    console.log('✅ Questions table accessible');
    
    // Test 2: Count existing questions
    console.log('2. Counting existing questions...');
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting questions:', countError.message);
      return false;
    }
    
    console.log(`✅ Found ${count} existing questions`);
    
    // Test 3: Check question structure
    console.log('3. Checking question structure...');
    const { data: sampleQuestion, error: sampleError } = await supabase
      .from('questions')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleError) {
      console.error('❌ Error fetching sample question:', sampleError.message);
      return false;
    }
    
    if (sampleQuestion) {
      console.log('✅ Sample question structure:');
      console.log(`  - ID: ${sampleQuestion.question_id}`);
      console.log(`  - Module: ${sampleQuestion.module}`);
      console.log(`  - Difficulty: ${sampleQuestion.difficulty}`);
      console.log(`  - Has content: ${!!sampleQuestion.content}`);
      console.log(`  - Has options: ${!!sampleQuestion.content?.options}`);
    }
    
    // Test 4: Check by module
    console.log('4. Checking questions by module...');
    const { data: moduleStats, error: moduleError } = await supabase
      .from('questions')
      .select('module')
      .eq('active', true);
    
    if (moduleError) {
      console.error('❌ Error fetching module stats:', moduleError.message);
      return false;
    }
    
    const moduleCounts = {};
    moduleStats.forEach(q => {
      moduleCounts[q.module] = (moduleCounts[q.module] || 0) + 1;
    });
    
    console.log('✅ Questions by module:');
    Object.entries(moduleCounts).forEach(([module, count]) => {
      console.log(`  - ${module}: ${count} questions`);
    });
    
    // Test 5: Check by difficulty
    console.log('5. Checking questions by difficulty...');
    const { data: difficultyStats, error: difficultyError } = await supabase
      .from('questions')
      .select('difficulty')
      .eq('active', true);
    
    if (difficultyError) {
      console.error('❌ Error fetching difficulty stats:', difficultyError.message);
      return false;
    }
    
    const difficultyCounts = {};
    difficultyStats.forEach(q => {
      difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1;
    });
    
    console.log('✅ Questions by difficulty:');
    Object.entries(difficultyCounts).forEach(([difficulty, count]) => {
      console.log(`  - ${difficulty}: ${count} questions`);
    });
    
    // Test 6: Verify content structure
    console.log('6. Verifying content structure...');
    const { data: contentCheck, error: contentError } = await supabase
      .from('questions')
      .select('content')
      .not('content', 'is', null)
      .limit(1)
      .single();
    
    if (contentError) {
      console.error('❌ Error checking content structure:', contentError.message);
      return false;
    }
    
    if (contentCheck?.content) {
      const content = contentCheck.content;
      console.log('✅ Content structure verified:');
      console.log(`  - Has question: ${!!content.question}`);
      console.log(`  - Has options: ${!!content.options}`);
      console.log(`  - Has correct_answer: ${!!content.correct_answer}`);
      console.log(`  - Options count: ${content.options?.length || 0}`);
    }
    
    console.log('\n🎉 All tests passed! Your SAT question import is working correctly.');
    console.log('\n📊 Summary:');
    console.log(`  - Total questions: ${count}`);
    console.log(`  - Modules: ${Object.keys(moduleCounts).join(', ')}`);
    console.log(`  - Difficulties: ${Object.keys(difficultyCounts).join(', ')}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testImport().then(success => {
  if (!success) {
    process.exit(1);
  }
}); 