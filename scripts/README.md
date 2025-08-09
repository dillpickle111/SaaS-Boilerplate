# 📚 Prepify Question Import Scripts

This directory contains TypeScript scripts for importing and managing SAT questions in your Supabase database.

## 🚀 Quick Start

### Prerequisites

1. **Environment Variables**: Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Database Tables**: Ensure your Supabase database has the required tables:
   - `pdf_set` - PDF set metadata
   - `question` - Question data with PDF set relationships
   - `question_category` - Question categories
   - `user_progress` - User progress tracking
   - `practice_session` - Practice session data

### Question JSON Format

Each JSON file should have this structure:
```json
{
  "pdfSet": {
    "label": "SAT-Math-Set-01",
    "storage_path": "data/pdfs/SAT-Math-Set-01.pdf",
    "total_questions": 50,
    "total_pages": 18,
    "title": "Official Practice Test 8",
    "year": 2020
  },
  "questions": [
    {
      "question_number": 1,
      "title": "Algebra Equation",
      "content": "What is the value of x in the equation 2x + 5 = 13?",
      "options": ["3", "4", "5", "6"],
      "correct_answer": "4",
      "explanation": "Subtract 5 from both sides: 2x = 8. Then divide by 2: x = 4.",
      "section": "Math",
      "topic": "Algebra",
      "subtopic": "Linear Equations",
      "difficulty": "easy",
      "pdf_page_from": 1,
      "pdf_page_to": 1,
      "question_uid": "SAT-Math-Set-01-Q1"
    }
  ]
}
```

## 📋 Available Scripts

### 1. Import Questions from JSON
```bash
npm run import:json
# or
npx tsx scripts/import-from-json.ts
```

**What it does:**
- Reads questions from `data/questions.json` or all JSON files in `data/questions/`
- Creates/updates PDF set metadata in the database
- Maps question data to database schema
- Validates questions and skips invalid ones
- Generates checksums for data integrity
- Logs detailed import statistics

**Features:**
- ✅ **Strict validation** - Skips questions missing content or answers
- ✅ **Duplicate prevention** - Uses `question_uid` for conflict resolution
- ✅ **PDF set management** - Automatically creates/updates PDF set records
- ✅ **Comprehensive logging** - Shows insert/update/skip/error counts
- ✅ **Data integrity** - Generates SHA256 checksums for content

**Output:**
```
🚀 Starting JSON import process...
📖 Loading data/questions.json...
📊 Processing 1 dataset(s)...

📚 Processing PDF Set: SAT-Math-Set-01
   Storage Path: data/pdfs/SAT-Math-Set-01.pdf
   Questions: 3
✅ PDF Set ID: 1
   ✅ Inserted: 3, Updated: 0, Skipped: 0, Errors: 0

🎉 Import Summary:
   📥 Inserted: 3
   🔄 Updated: 0
   ⏭️  Skipped: 0
   ❌ Errors: 0
   📊 Total Processed: 3
```

### 2. Check Database Counts and Integrity
```bash
npm run check:counts
# or
npx tsx scripts/check-counts.ts
```

**What it does:**
- Counts total PDF sets and questions
- Validates per-set question counts against expected totals
- Checks for duplicate `question_uid` values
- Checks for duplicate `(pdf_set_id, question_number)` pairs
- Identifies orphaned questions without PDF sets
- Reports missing required fields (content, answers)

**Output:**
```
🔍 Checking database counts and integrity...

📊 Total Counts:
   📚 PDF Sets: 2
   ❓ Questions: 150

📋 Per-Set Question Counts:
   ✅ SAT-Math-Set-01: 50
   ⚠️  SAT-Reading-Set-01: 45 (expected 50)

🔍 Duplicate Checks:
   ✅ No duplicate question_uid found
   ✅ No duplicate (pdf_set_id, question_number) found

🔗 Data Integrity:
   ✅ All questions have valid pdf_set_id

📝 Data Quality:
   ✅ All questions have content
   ✅ All questions have correct_answer

🎉 Count check complete!
```

### 3. Seed PDF Set with Placeholder Data
```bash
npm run seed:pdfset "SAT-Math-Set-03" "data/pdfs/SAT-Math-Set-03.pdf" 50 18 "Official Practice Test 8" 2020
# or
npx tsx scripts/seed-pdf-set.ts "SAT-Math-Set-03" "data/pdfs/SAT-Math-Set-03.pdf" 50 18 "Official Practice Test 8" 2020
```

**What it does:**
- Creates a new PDF set record in the database
- Generates a JSON file with placeholder questions
- Validates PDF file existence
- Provides next steps for manual question editing

**Arguments:**
- `label` - Unique identifier for the PDF set
- `storage_path` - Path to the PDF file
- `total_questions` - Number of questions in the set
- `total_pages` - Number of pages in the PDF
- `title` (optional) - Human-readable title
- `year` (optional) - Year of the test

**Output:**
```
🌱 Seeding PDF set...

📋 Arguments:
   Label: SAT-Math-Set-03
   Storage Path: data/pdfs/SAT-Math-Set-03.pdf
   Total Questions: 50
   Total Pages: 18
   Title: Official Practice Test 8
   Year: 2020

✅ Created JSON file: data/questions/SAT-Math-Set-03.json
📊 Generated 50 placeholder questions
📄 PDF Set: SAT-Math-Set-03 (18 pages)

🔄 Upserting PDF set in database...
✅ PDF set upserted with ID: 2

🎉 PDF set seeding complete!
📁 JSON file: data/questions/SAT-Math-Set-03.json
🗄️  Database ID: 2

📝 Next steps:
   1. Edit data/questions/SAT-Math-Set-03.json to add real question content
   2. Run: npm run import:json
   3. Run: npm run check:counts
```

## 🔧 Database Schema

The scripts expect these database tables:

### `pdf_set` Table
```sql
CREATE TABLE pdf_set (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  storage_path TEXT NOT NULL UNIQUE,
  total_questions INTEGER NOT NULL,
  total_pages INTEGER NOT NULL,
  title TEXT,
  year INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `question` Table
```sql
CREATE TABLE question (
  id SERIAL PRIMARY KEY,
  pdf_set_id INTEGER REFERENCES pdf_set(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  section TEXT DEFAULT 'Math',
  topic TEXT,
  subtopic TEXT,
  difficulty INTEGER DEFAULT 1,
  question_number INTEGER NOT NULL,
  pdf_page_from INTEGER,
  pdf_page_to INTEGER,
  source_ref TEXT,
  question_uid TEXT UNIQUE NOT NULL,
  assets JSONB,
  checksum TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pdf_set_id, question_number)
);
```

## 📁 File Structure

```
scripts/
├── import-from-json.ts    # Main import script
├── check-counts.ts        # Count and integrity checker
├── seed-pdf-set.ts       # PDF set seeder
├── import-questions.ts    # Legacy import script
├── check-questions.ts     # Legacy count checker
└── README.md            # This file

data/
├── questions.json        # Single questions file
└── questions/           # Multiple JSON files
    ├── SAT-Math-Set-01.json
    ├── SAT-Reading-Set-01.json
    └── SAT-Writing-Set-01.json

data/pdfs/               # PDF files
    ├── SAT-Math-Set-01.pdf
    ├── SAT-Reading-Set-01.pdf
    └── SAT-Writing-Set-01.pdf
```

## 🛠 Troubleshooting

### ❌ "pdf_set table does not exist"
- Run the database migration SQL in your Supabase dashboard
- Ensure all required tables are created

### ❌ "supabaseUrl is required"
- Check that `.env.local` exists and has `NEXT_PUBLIC_SUPABASE_URL`
- Restart your terminal after adding environment variables

### ❌ "No questions found"
- Make sure `data/questions.json` exists or `data/questions/` directory has JSON files
- Check file permissions and JSON syntax

### ❌ "Row error" during import
- Verify your Supabase credentials are correct
- Check that the database schema matches expectations
- Ensure you have write permissions to the tables

### ❌ "Permission denied"
- Make sure you're using the `SUPABASE_SERVICE_ROLE_KEY` (not the anon key)
- Check Row Level Security (RLS) policies in Supabase

## 📊 Example Workflow

1. **Seed a new PDF set**:
   ```bash
   npm run seed:pdfset "SAT-Math-Set-02" "data/pdfs/SAT-Math-Set-02.pdf" 45 16 "Practice Test 9" 2021
   ```

2. **Edit the generated JSON file**:
   ```bash
   # Edit data/questions/SAT-Math-Set-02.json
   # Add real question content, options, and answers
   ```

3. **Import the questions**:
   ```bash
   npm run import:json
   ```

4. **Verify the import**:
   ```bash
   npm run check:counts
   ```

5. **Repeat for additional sets**:
   ```bash
   # Create more JSON files in data/questions/
   # Run import again to process all files
   ```

## 📈 Performance Tips

- **Large imports**: The script processes questions one by one with detailed logging
- **Error handling**: Failed questions are logged but don't stop the import
- **Progress tracking**: Real-time progress updates during import
- **Duplicate prevention**: Uses `question_uid` for conflict resolution
- **Data validation**: Strict validation ensures data quality
- **Checksums**: SHA256 checksums for data integrity verification

## 🔄 Batch Processing

For large datasets, you can split questions into multiple files:

```bash
# Create separate files for different PDF sets
mkdir -p data/questions
cp math-questions.json data/questions/SAT-Math-Set-01.json
cp reading-questions.json data/questions/SAT-Reading-Set-01.json
cp writing-questions.json data/questions/SAT-Writing-Set-01.json

# Import all files at once
npm run import:json
```

The script will automatically load and import all JSON files in the `data/questions/` directory.

---

**🎉 Ready to import your SAT questions!** Make sure your Supabase credentials are set up and your question JSON files are ready.
