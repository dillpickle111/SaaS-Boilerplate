const fs = require('node:fs');
const path = require('node:path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample questions based on the OnePrep interface you showed
const sampleQuestions = [
  {
    question_id: 'manual-001',
    skill_cd: 'H.C.',
    skill_desc: 'Linear equations in two variables',
    primary_class_cd: 'H',
    primary_class_cd_desc: 'Algebra',
    difficulty: 'M',
    module: 'math',
    content: {
      keys: ['3/17', '17/3', '-3/17', '-17/3'],
      options: ['3/17', '17/3', '-3/17', '-17/3'],
      question: 'Line k is defined by y=−17/3x+5. Line j is perpendicular to line k in the xy-plane. What is the slope of line j?',
      rationale: 'For perpendicular lines, the product of their slopes equals -1. If line k has slope -17/3, then line j must have slope 3/17 because (-17/3) × (3/17) = -1.',
      explanation: 'For perpendicular lines, the product of their slopes equals -1. If line k has slope -17/3, then line j must have slope 3/17 because (-17/3) × (3/17) = -1.',
      correct_answer: ['3/17'],
    },
    program: 'SAT',
    score_band_range_cd: 5,
  },
  {
    question_id: 'manual-002',
    skill_cd: 'H.A.',
    skill_desc: 'Systems of linear equations',
    primary_class_cd: 'H',
    primary_class_cd_desc: 'Algebra',
    difficulty: 'M',
    module: 'math',
    content: {
      keys: ['3', '4', '5', '6'],
      options: ['3', '4', '5', '6'],
      question: 'If 2x + 3y = 12 and x - y = 2, what is the value of x?',
      rationale: 'From x - y = 2, we get y = x - 2. Substituting into 2x + 3y = 12: 2x + 3(x - 2) = 12 → 2x + 3x - 6 = 12 → 5x = 18 → x = 4.',
      explanation: 'From x - y = 2, we get y = x - 2. Substituting into 2x + 3y = 12: 2x + 3(x - 2) = 12 → 2x + 3x - 6 = 12 → 5x = 18 → x = 4.',
      correct_answer: ['4'],
    },
    program: 'SAT',
    score_band_range_cd: 4,
  },
  {
    question_id: 'manual-003',
    skill_cd: 'G.A.',
    skill_desc: 'Area of circles',
    primary_class_cd: 'G',
    primary_class_cd_desc: 'Geometry',
    difficulty: 'E',
    module: 'math',
    content: {
      keys: ['25π', '50π', '75π', '100π'],
      options: ['25π', '50π', '75π', '100π'],
      question: 'A circle has a radius of 5 units. What is the area of the circle?',
      rationale: 'The area of a circle is πr². With r = 5, the area is π(5)² = 25π.',
      explanation: 'The area of a circle is πr². With r = 5, the area is π(5)² = 25π.',
      correct_answer: ['25π'],
    },
    program: 'SAT',
    score_band_range_cd: 3,
  },
];

class ManualQuestionImporter {
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

  async importSampleQuestions() {
    console.log('📝 Importing sample questions...');

    for (const questionData of sampleQuestions) {
      const question = {
        question_id: questionData.question_id,
        skill_cd: questionData.skill_cd,
        skill_desc: questionData.skill_desc,
        primary_class_cd: questionData.primary_class_cd,
        primary_class_cd_desc: questionData.primary_class_cd_desc,
        difficulty: questionData.difficulty,
        module: questionData.module,
        content: questionData.content,
        program: questionData.program,
        score_band_range_cd: questionData.score_band_range_cd,
        active: true,
      };

      this.questions.push(question);
    }

    console.log(`✅ Prepared ${this.questions.length} sample questions`);
    return this.questions;
  }

  async saveToFile(questions, filename = 'manual-questions.json') {
    const filepath = path.join(this.dataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(questions, null, 2));
    console.log(`💾 Saved questions to: ${filepath}`);
    return filepath;
  }

  async importToSupabase(questions) {
    console.log('📤 Importing questions to Supabase...');

    const { data, error } = await supabase
      .from('questions')
      .insert(questions);

    if (error) {
      console.error('❌ Error importing to Supabase:', error);
      return false;
    }

    console.log(`✅ Successfully imported ${questions.length} questions to Supabase`);
    return true;
  }

  async createQuestionFromInput() {
    console.log('\n🎯 Manual Question Creation Mode');
    console.log('Enter question details (press Enter to skip optional fields):\n');

    const readline = require('node:readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = await new Promise((resolve) => {
      const questionData = {};

      rl.question('Question ID: ', (answer) => {
        questionData.question_id = answer;
        rl.question('Skill code (e.g., H.C.): ', (answer) => {
          questionData.skill_cd = answer;
          rl.question('Skill description: ', (answer) => {
            questionData.skill_desc = answer;
            rl.question('Primary class code (e.g., H): ', (answer) => {
              questionData.primary_class_cd = answer;
              rl.question('Primary class description: ', (answer) => {
                questionData.primary_class_cd_desc = answer;
                rl.question('Difficulty (E/M/H): ', (answer) => {
                  questionData.difficulty = answer;
                  rl.question('Module (math/reading/writing): ', (answer) => {
                    questionData.module = answer;
                    rl.question('Question text: ', (answer) => {
                      questionData.question = answer;
                      rl.question('Options (comma-separated): ', (answer) => {
                        questionData.options = answer.split(',').map(opt => opt.trim());
                        rl.question('Correct answer(s) (comma-separated): ', (answer) => {
                          questionData.correct_answer = answer.split(',').map(opt => opt.trim());
                          rl.question('Explanation: ', (answer) => {
                            questionData.explanation = answer;
                            rl.question('Score band range (1-5): ', (answer) => {
                              questionData.score_band_range_cd = Number.parseInt(answer) || 3;
                              rl.close();
                              resolve(questionData);
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    return {
      question_id: question.question_id,
      skill_cd: question.skill_cd,
      skill_desc: question.skill_desc,
      primary_class_cd: question.primary_class_cd,
      primary_class_cd_desc: question.primary_class_cd_desc,
      difficulty: question.difficulty,
      module: question.module,
      content: {
        keys: question.options,
        options: question.options,
        question: question.question,
        rationale: question.explanation,
        explanation: question.explanation,
        correct_answer: question.correct_answer,
      },
      program: 'SAT',
      score_band_range_cd: question.score_band_range_cd,
      active: true,
    };
  }
}

async function main() {
  const importer = new ManualQuestionImporter();

  console.log('🚀 Manual Question Importer');
  console.log('============================\n');

  const args = process.argv.slice(2);

  if (args.includes('--sample')) {
    // Import sample questions
    const questions = await importer.importSampleQuestions();
    await importer.saveToFile(questions);
    await importer.importToSupabase(questions);
  } else if (args.includes('--interactive')) {
    // Interactive mode
    const question = await importer.createQuestionFromInput();
    console.log('\n📝 Created question:', question);

    const save = await new Promise((resolve) => {
      const readline = require('node:readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('\nSave to file and import to Supabase? (y/n): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });

    if (save) {
      await importer.saveToFile([question], 'manual-questions.json');
      await importer.importToSupabase([question]);
    }
  } else {
    console.log('Usage:');
    console.log('  node scripts/manual-question-import.js --sample     # Import sample questions');
    console.log('  node scripts/manual-question-import.js --interactive # Interactive mode');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ManualQuestionImporter };
