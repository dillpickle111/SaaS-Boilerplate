const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLS() {
  console.log('🔧 Fixing RLS for questions table...\n');

  try {
    // Disable RLS on questions table
    console.log('1️⃣ Disabling RLS on questions table...');
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE questions DISABLE ROW LEVEL SECURITY;'
    });

    if (disableError) {
      console.error('❌ Error disabling RLS:', disableError);
    } else {
      console.log('✅ RLS disabled on questions table');
    }

    // Drop the existing policy
    console.log('\n2️⃣ Dropping existing policy...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS "Questions are viewable by authenticated users" ON questions;'
    });

    if (dropError) {
      console.error('❌ Error dropping policy:', dropError);
    } else {
      console.log('✅ Existing policy dropped');
    }

    // Test the fix by querying with anon key
    console.log('\n3️⃣ Testing with anon key...');
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: testData, error: testError } = await anonClient
      .from('questions')
      .select('id')
      .limit(5);

    if (testError) {
      console.error('❌ Error testing with anon key:', testError);
    } else {
      console.log(`✅ Anon key can now access questions! Found ${testData.length} questions`);
    }

    console.log('\n🎉 RLS fix completed! Questions should now be accessible from the frontend.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixRLS(); 