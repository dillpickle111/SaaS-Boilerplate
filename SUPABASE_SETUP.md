# 🚀 Supabase Setup Guide for Prepify

This guide will help you set up Supabase and import the SAT questions from the OnePrep repository.

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher
3. **Git**: For cloning the OnePrep repository

## 🗄️ Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Create New Project**:
   - Click "New Project"
   - Choose your organization
   - Enter project name: `prepify-sat-prep`
   - Set a secure database password
   - Choose a region close to your users
   - Click "Create new project"

3. **Wait for Setup**: This takes 1-2 minutes

## 🔑 Step 2: Get Your Supabase Credentials

1. **Go to Project Settings**:
   - In your Supabase dashboard, click the gear icon (Settings)
   - Click "API" in the sidebar

2. **Copy Your Credentials**:
   - **Project URL**: Copy the "Project URL" (looks like `https://xyz.supabase.co`)
   - **Anon Key**: Copy the "anon public" key

3. **Update Environment Variables**:
   ```bash
   # Edit your .env.local file
   nano .env.local
   ```

   Add these lines:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 🗄️ Step 3: Set Up Database Schema

1. **Go to SQL Editor**:
   - In your Supabase dashboard, click "SQL Editor" in the sidebar
   - Click "New query"

2. **Run the Schema**:
   - Copy the contents of `supabase-schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the schema

3. **Verify Tables**:
   - Go to "Table Editor" in the sidebar
   - You should see these tables:
     - `questions`
     - `user_progress`
     - `practice_sessions`
     - `session_questions`

## 📊 Step 4: Import SAT Questions

1. **Clone OnePrep Repository** (if not already done):
   ```bash
   cd ..
   git clone https://github.com/mdn522/sat-question-bank.git sat-question-bank-analysis
   ```

2. **Run the Import Script**:
   ```bash
   cd SaaS-Boilerplate
   node scripts/import-questions.js
   ```

3. **Monitor the Import**:
   - The script will show progress as it imports ~3,000 questions
   - It will display statistics when complete

## 🔧 Step 5: Test the Setup

1. **Start Your Development Server**:
   ```bash
   npm run dev
   ```

2. **Test the Connection**:
   - Visit `http://localhost:3000`
   - Navigate to the Question Bank
   - Questions should now load from Supabase

## 📊 Step 6: Verify Data Import

1. **Check Supabase Dashboard**:
   - Go to "Table Editor" → "questions"
   - You should see ~3,000 questions imported

2. **Check Import Statistics**:
   - The import script will show:
     - Total questions imported
     - Breakdown by module (Math, Reading, Writing)
     - Breakdown by difficulty (Easy, Medium, Hard)

## 🛠 Troubleshooting

### ❌ "Missing Supabase environment variables"
- Make sure you've added the environment variables to `.env.local`
- Restart your development server after adding them

### ❌ "Questions file not found"
- Make sure you've cloned the OnePrep repository
- Check that the path `../sat-question-bank-analysis/data/cb-digital-questions.json` exists

### ❌ "Error inserting batch"
- Check your Supabase connection
- Verify the database schema was created correctly
- Check the Supabase logs for more details

### ❌ "Permission denied"
- Make sure Row Level Security (RLS) policies are set up correctly
- Check that your Supabase credentials are correct

## 📈 Next Steps

After successful setup:

1. **Update Components**: Your existing components will now use real data from Supabase
2. **Add Authentication**: Connect Clerk authentication with Supabase user IDs
3. **Add Progress Tracking**: Implement user progress saving
4. **Add Practice Sessions**: Create timed practice sessions

## 🔐 Security Notes

- The schema includes Row Level Security (RLS) policies
- Users can only access their own progress data
- Questions are readable by all authenticated users
- Make sure to keep your Supabase keys secure

## 📞 Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify your environment variables
3. Test the connection with a simple query
4. Check the browser console for errors

---

**🎉 Congratulations!** Your Prepify app now has a powerful Supabase backend with 3,000+ SAT questions ready for practice! 