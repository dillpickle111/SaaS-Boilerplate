const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

class PDFQuestionExtractor {
  constructor() {
    this.questions = [];
    this.dataDir = path.join(__dirname, 'data');
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Check if required dependencies are installed
   */
  checkDependencies() {
    try {
      // Check if pdftotext is available (part of poppler-utils)
      execSync('which pdftotext', { stdio: 'ignore' });
      console.log('✅ pdftotext found');
    } catch (error) {
      console.log('⚠️  pdftotext not found. Installing poppler-utils...');
      try {
        if (process.platform === 'darwin') {
          execSync('brew install poppler', { stdio: 'inherit' });
        } else if (process.platform === 'linux') {
          execSync('sudo apt-get install poppler-utils', { stdio: 'inherit' });
        } else {
          console.log('❌ Please install poppler-utils manually:');
          console.log('  macOS: brew install poppler');
          console.log('  Ubuntu/Debian: sudo apt-get install poppler-utils');
          console.log('  Windows: Download from https://poppler.freedesktop.org/');
        }
      } catch (installError) {
        console.error('❌ Failed to install poppler-utils:', installError.message);
        process.exit(1);
      }
    }
  }

  /**
   * Extract text from PDF using pdftotext
   */
  extractTextFromPDF(pdfPath) {
    try {
      const output = execSync(`pdftotext -layout "${pdfPath}" -`, { encoding: 'utf8' });
      return output;
    } catch (error) {
      console.error(`❌ Error extracting text from ${pdfPath}:`, error.message);
      return null;
    }
  }

  /**
   * Parse questions from extracted text
   */
  parseQuestionsFromText(text, sourceFile) {
    const questions = [];
    const lines = text
      .replace(/[\u00AD\-]\n/g, '') // remove hyphenated line breaks
      .replace(/\r/g, '')
      .split('\n')
      .map(l => (l || '').trim());

    const isRW = /(^|[^A-Za-z])RW([^A-Za-z]|$)/.test(sourceFile);
    const isMath = /(^|[^A-Za-z])M([^A-Za-z]|$)/.test(sourceFile) && !isRW;
    const module = isMath ? 'math' : 'reading';

    let current = null;
    const pushCurrentIfValid = () => {
      if (!current) return;
      // Keep only first 4 options and ensure uniqueness and non-empty
      const seen = new Set();
      current.content.options = (current.content.options || [])
        .map(s => s.replace(/\s+/g, ' ').trim())
        .filter(s => s.length > 0 && !seen.has(s) && (seen.add(s), true))
        .slice(0, 4);

      if (current.content.options.length !== 4) {
        current = null;
        return;
      }

      // Map correct answer letter to option text when possible
      if (current._correctLetter) {
        const idx = 'ABCD'.indexOf(current._correctLetter);
        if (idx >= 0 && current.content.options[idx]) {
          current.content.correct_answer = current.content.options[idx];
        }
      }

      // Fallback to first option if no correct answer
      if (!current.content.correct_answer || typeof current.content.correct_answer !== 'string') {
        current.content.correct_answer = current.content.options[0];
      }

      // Clean question text by removing metadata labels
      current.content.question = (current.content.question || '')
        .replace(/\s+/g, ' ')
        .replace(/\b(Question\s*Difficulty:.*?)(?=\.|$)/gi, '')
        .replace(/\b(Question\s*ID\s*[A-Za-z0-9\-]+)/gi, '')
        .replace(/\b(Answer\s+Correct\s+Answer:.*)$/i, '')
        .replace(/\b(Rationale)\b.*$/i, '')
        .trim();

      // Rationale cleanup
      current.content.explanation = (current.content.explanation || current.content.rationale || '')
        .replace(/^Rationale\s*:?\s*/i, '')
        .trim();
      current.content.rationale = current.content.explanation;

      // Map difficulty words to E/M/H
      if (current._difficulty) {
        const d = current._difficulty.toLowerCase();
        current.difficulty = d.startsWith('e') ? 'E' : d.startsWith('h') ? 'H' : 'M';
      }

      // Assign module/subject
      current.module = module;

      // Finalize
      delete current._correctLetter;
      delete current._difficulty;
      questions.push(current);
      current = null;
    };

    const optionRegexes = [
      /^([A-D])[.)]\s*(.+)$/i,
      /^([A-D])\)\s*(.+)$/i,
      /^\(([A-D])\)\s*(.+)$/i,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // Start of a new question by explicit metadata markers
      const qIdMatch = line.match(/^Question\s*ID\s*([A-Za-z0-9\-]+)/i);
      const qNumMatch = line.match(/^(\d+)[.)]\s+(.+)/);
      if (qIdMatch || qNumMatch) {
        // Close previous
        pushCurrentIfValid();

        const baseId = qIdMatch ? qIdMatch[1] : `${path.basename(sourceFile, '.pdf')}-${qNumMatch[1]}`;
        current = {
          question_id: `pdf-${baseId}`,
          skill_cd: '',
          skill_desc: '',
          primary_class_cd: '',
          primary_class_cd_desc: '',
          difficulty: 'M',
          module,
          content: {
            keys: [],
            options: [],
            question: qNumMatch ? qNumMatch[2].trim() : '',
            rationale: '',
            explanation: '',
            correct_answer: '',
          },
          program: 'SAT',
          score_band_range_cd: 3,
          active: true,
          source: sourceFile,
        };
        continue;
      }

      if (!current) {
        // try to detect narrative start before metadata; gather until options appear
        if (/^[A-Z].+/.test(line)) {
          current = {
            question_id: `pdf-${path.basename(sourceFile, '.pdf')}-${questions.length + 1}`,
            skill_cd: '',
            skill_desc: '',
            primary_class_cd: '',
            primary_class_cd_desc: '',
            difficulty: 'M',
            module,
            content: { keys: [], options: [], question: line, rationale: '', explanation: '', correct_answer: '' },
            program: 'SAT',
            score_band_range_cd: 3,
            active: true,
            source: sourceFile,
          };
        }
        continue;
      }

      // Difficulty
      const diffMatch = line.match(/^Question\s*Difficulty\s*:\s*(Easy|Medium|Hard)/i);
      if (diffMatch) {
        current._difficulty = diffMatch[1];
        continue;
      }

      // Correct answer
      const caMatch = line.match(/^Correct\s*Answer\s*:\s*([A-D])/i) || line.match(/Answer\s+Correct\s+Answer\s*:\s*([A-D])/i);
      if (caMatch) {
        current._correctLetter = caMatch[1].toUpperCase();
        continue;
      }

      // Rationale start
      if (/^Rationale\b/i.test(line)) {
        const rationalLines = [];
        let j = i;
        // include this line's content after the label
        rationalLines.push(line.replace(/^Rationale\s*:?\s*/i, '').trim());
        j++;
        while (j < lines.length) {
          const l = lines[j];
          if (!l) { j++; continue; }
          if (/^Question\s*ID\b/i.test(l) || /^(\d+)[.)]\s+/.test(l) || /^Correct\s*Answer\s*:/i.test(l)) {
            break;
          }
          rationalLines.push(l);
          j++;
        }
        current.content.explanation = rationalLines.join(' ').trim();
        i = j - 1;
        continue;
      }

      // Options A-D
      let optionMatch = null;
      for (const r of optionRegexes) {
        const m = line.match(r);
        if (m) { optionMatch = m; break; }
      }
      if (optionMatch && current.content.options.length < 4) {
        const letter = optionMatch[1].toUpperCase();
        const textOpt = (optionMatch[2] || '').trim();
        if (textOpt && 'ABCD'.includes(letter)) {
          current.content.options.push(textOpt);
          current.content.keys.push(textOpt);
        }
        continue;
      }

      // Append to question stem if not metadata
      if (!/^Question\s*Difficulty\b/i.test(line) && !/^Question\s*ID\b/i.test(line) && !/^Answer\b/i.test(line)) {
        current.content.question = current.content.question ? `${current.content.question} ${line}` : line;
      }
    }

    // Push the last one
    pushCurrentIfValid();

    return questions;
  }

  /**
   * Extract questions from a single PDF file
   */
  extractQuestionsFromPDF(pdfPath) {
    console.log(`📖 Processing: ${path.basename(pdfPath)}`);

    const text = this.extractTextFromPDF(pdfPath);
    if (!text) {
      console.log(`❌ Failed to extract text from ${pdfPath}`);
      return [];
    }

    const questions = this.parseQuestionsFromText(text, path.basename(pdfPath));
    console.log(`✅ Extracted ${questions.length} questions from ${path.basename(pdfPath)}`);

    return questions;
  }

  /**
   * Process all PDFs in a directory
   */
  async processPDFDirectory(pdfDir) {
    console.log(`🔍 Scanning directory: ${pdfDir}`);

    if (!fs.existsSync(pdfDir)) {
      console.error(`❌ Directory not found: ${pdfDir}`);
      return [];
    }

    const files = fs.readdirSync(pdfDir);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      console.log(`❌ No PDF files found in ${pdfDir}`);
      return [];
    }

    console.log(`📚 Found ${pdfFiles.length} PDF files`);

    let allQuestions = [];

    for (const pdfFile of pdfFiles) {
      const pdfPath = path.join(pdfDir, pdfFile);
      const questions = this.extractQuestionsFromPDF(pdfPath);
      allQuestions = allQuestions.concat(questions);
    }

    return allQuestions;
  }

  /**
   * Clean and validate questions
   */
  cleanQuestions(questions) {
    return questions.map((question, index) => {
      // Clean question text
      question.content.question = question.content.question
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^[A-D][.)]\s*/, ''); // Remove leading option markers

      // Ensure question has content
      if (question.content.question.length < 10) {
        question.content.question = `Question ${index + 1}`;
      }

      // Clean options
      question.content.options = question.content.options
        .map(opt => opt.replace(/\s+/g, ' ').trim())
        .filter(opt => opt.length > 0);

      // Ensure we have at least 2 options
      if (question.content.options.length < 2) {
        question.content.options = ['A', 'B', 'C', 'D'];
        question.content.keys = ['A', 'B', 'C', 'D'];
      }

      // Set default correct answer if not present
      if (!question.content.correct_answer || question.content.correct_answer.length === 0) {
        question.content.correct_answer = [question.content.options[0] || 'A'];
      }

      return question;
    }).filter(question => question.content.question.length > 10);
  }

  /**
   * Save questions to JSON file
   */
  saveQuestions(questions, filename = 'import-ready-questions.json') {
    const filepath = path.join(this.dataDir, filename);
    const cleanedQuestions = this.cleanQuestions(questions);

    fs.writeFileSync(filepath, JSON.stringify(cleanedQuestions, null, 2));
    console.log(`💾 Saved ${cleanedQuestions.length} questions to: ${filepath}`);

    return filepath;
  }

  /**
   * Validate questions structure
   */
  validateQuestions(questions) {
    const errors = [];
    const warnings = [];

    questions.forEach((question, index) => {
      // Check required fields
      if (!question.question_id) {
        errors.push(`Question ${index}: Missing question_id`);
      }
      if (!question.content.question || question.content.question.length < 10) {
        errors.push(`Question ${index}: Question text too short`);
      }
      if (!question.content.options || question.content.options.length < 2) {
        errors.push(`Question ${index}: Not enough options`);
      }
      if (!question.content.correct_answer || question.content.correct_answer.length === 0) {
        warnings.push(`Question ${index}: No correct answer specified`);
      }
      if (!question.difficulty) {
        warnings.push(`Question ${index}: No difficulty specified`);
      }
      if (!question.module) {
        warnings.push(`Question ${index}: No module specified`);
      }
    });

    if (errors.length > 0) {
      console.log('❌ Validation errors:');
      errors.forEach(error => console.log(`  - ${error}`));
    }

    if (warnings.length > 0) {
      console.log('⚠️  Validation warnings:');
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    return errors.length === 0;
  }

  /**
   * Main extraction process
   */
  async extractFromDirectory(pdfDir) {
    console.log('🚀 Starting PDF Question Extraction');
    console.log('====================================\n');

    // Check dependencies
    this.checkDependencies();

    // Process PDFs
    const questions = await this.processPDFDirectory(pdfDir);

    if (questions.length === 0) {
      console.log('❌ No questions extracted');
      return null;
    }

    console.log(`\n📊 Extraction Summary:`);
    console.log(`  - Total questions extracted: ${questions.length}`);
    console.log(`  - Questions with options: ${questions.filter(q => q.content.options.length > 0).length}`);
    console.log(`  - Questions with correct answers: ${questions.filter(q => q.content.correct_answer.length > 0).length}`);

    // Validate questions
    console.log('\n🔍 Validating questions...');
    const isValid = this.validateQuestions(questions);

    if (!isValid) {
      console.log('❌ Validation failed. Please review the errors above.');
      return null;
    }

    // Save questions
    const filepath = this.saveQuestions(questions);

    console.log('\n✅ Extraction complete!');
    console.log(`📁 Questions saved to: ${filepath}`);
    console.log('\n🎯 Next steps:');
    console.log('1. Review the extracted questions in the JSON file');
    console.log('2. Run: node scripts/enhanced-import-questions.js');
    console.log('3. Test the questions in your Prepify app');

    return filepath;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const extractor = new PDFQuestionExtractor();

  if (args.length === 0) {
    console.log('Usage: node scripts/pdf-question-extractor.js <pdf-directory>');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/pdf-question-extractor.js /Users/dhilanmartin/Documents/sat');
    console.log('');
    console.log('This will:');
    console.log('1. Extract questions from all PDFs in the directory');
    console.log('2. Parse questions, options, and answers');
    console.log('3. Save to scripts/data/import-ready-questions.json');
    console.log('4. Validate the structure for Supabase import');
    process.exit(1);
  }

  const pdfDir = args[0];
  await extractor.extractFromDirectory(pdfDir);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { PDFQuestionExtractor };
