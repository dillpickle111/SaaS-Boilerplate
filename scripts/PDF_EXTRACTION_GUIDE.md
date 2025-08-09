# 📄 PDF Question Extraction Guide

This guide will help you extract questions from SAT PDFs and import them into Prepify.

## 🚀 Quick Start

### Step 1: Extract Questions from PDFs

```bash
# Extract questions from your SAT PDFs
node scripts/pdf-question-extractor.js /Users/dhilanmartin/Documents/sat
```

This will:
- ✅ Scan all PDFs in the directory
- ✅ Extract questions, options, and answers
- ✅ Save to `scripts/data/import-ready-questions.json`
- ✅ Validate the structure for Supabase import

### Step 2: Import to Supabase

```bash
# Import the extracted questions
node scripts/enhanced-import-questions.js
```

### Step 3: Test in Prepify

```bash
# Start your dev server (if not already running)
npm run dev

# Visit: http://localhost:3001/questions
```

## 📊 Detailed Process

### Step 1: PDF Extraction

The `pdf-question-extractor.js` script will:

1. **Check Dependencies**
   - ✅ Verify `pdftotext` is installed (part of poppler-utils)
   - ✅ Auto-install if missing (macOS: `brew install poppler`)

2. **Process PDFs**
   - 📖 Extract text from each PDF using `pdftotext`
   - 🔍 Parse questions using regex patterns
   - 🎯 Identify question numbers, text, options, and answers
   - 🧹 Clean and validate the extracted data

3. **Output Format**
   ```json
   [
     {
       "question_id": "pdf-sat-practice-1",
       "skill_cd": "",
       "skill_desc": "",
       "primary_class_cd": "",
       "primary_class_cd_desc": "",
       "difficulty": "M",
       "module": "math",
       "content": {
         "keys": ["3/17", "17/3", "-3/17", "-17/3"],
         "options": ["3/17", "17/3", "-3/17", "-17/3"],
         "question": "Line k is defined by y=−17/3x+5. Line j is perpendicular to line k in the xy-plane. What is the slope of line j?",
         "rationale": "",
         "explanation": "",
         "correct_answer": ["3/17"]
       },
       "program": "SAT",
       "score_band_range_cd": 3,
       "active": true,
       "source": "sat-practice.pdf"
     }
   ]
   ```

### Step 2: Validation

The script validates:
- ✅ Question text length (minimum 10 characters)
- ✅ At least 2 options per question
- ✅ Correct answer specified
- ✅ Required fields present

### Step 3: Import to Supabase

The `enhanced-import-questions.js` script will:
- 📤 Import questions to the `questions` table
- 🔄 Handle duplicates (upsert based on `question_id`)
- 📊 Provide import statistics
- ✅ Validate final database state

## 🎯 Supported PDF Formats

The extractor recognizes these question patterns:

### Question Patterns
- `1. Question text`
- `Question 1. Question text`
- `Problem 1. Question text`
- `1) Question text`

### Option Patterns
- `A. Option text`
- `A) Option text`
- `(A) Option text`

### Example PDF Structure
```
1. Line k is defined by y=−17/3x+5. Line j is perpendicular to line k in the xy-plane. What is the slope of line j?

A. 3/17
B. 17/3
C. -3/17
D. -17/3
```

## 🔧 Troubleshooting

### Common Issues

1. **pdftotext not found**
   ```bash
   # macOS
   brew install poppler
   
   # Ubuntu/Debian
   sudo apt-get install poppler-utils
   
   # Windows
   # Download from https://poppler.freedesktop.org/
   ```

2. **No questions extracted**
   - Check PDF format matches supported patterns
   - Verify PDFs are text-based (not scanned images)
   - Review extracted text in console output

3. **Import errors**
   - Check Supabase connection in `.env.local`
   - Verify `questions` table exists
   - Review question structure in JSON file

### Validation Errors

If validation fails, check:
- Question text is too short (< 10 characters)
- Missing options (need at least 2)
- No correct answer specified
- Missing required fields

## 📈 Scaling Up

### Batch Processing

For large numbers of PDFs:
1. **Organize PDFs** by topic/type
2. **Run extraction** on each folder
3. **Combine results** manually if needed
4. **Review and clean** before import

### Quality Control

- **Review extracted questions** before import
- **Check answer accuracy** (may need manual review)
- **Verify question formatting** (math formulas, images)
- **Test questions** in Prepify interface

## 🎉 Success Checklist

- ✅ PDFs processed successfully
- ✅ Questions extracted and validated
- ✅ JSON file created: `scripts/data/import-ready-questions.json`
- ✅ Questions imported to Supabase
- ✅ Questions visible in Prepify app
- ✅ Questions display correctly with options and answers

## 🔄 Next Steps

After successful import:

1. **Review questions** in Prepify app
2. **Test question functionality** (answering, explanations)
3. **Add missing metadata** (difficulty, skills, categories)
4. **Scale up** with more PDFs
5. **Optimize extraction** for specific PDF formats

## 📞 Support

If you encounter issues:

1. **Check console output** for error messages
2. **Verify PDF format** matches supported patterns
3. **Review validation errors** in the JSON file
4. **Test with a single PDF** first
5. **Check Supabase connection** and permissions

The PDF extraction workflow is now **fully automated** and ready for your SAT questions! 🎯 