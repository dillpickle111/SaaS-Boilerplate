const fs = require('node:fs');
const path = require('node:path');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// OnePrep site configuration
const ONEPREP_CONFIG = {
  baseUrl: 'https://oneprep.xyz',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
};

/**
 * Fetch questions from OnePrep's question bank
 */
async function fetchOnePrepQuestions() {
  console.log('🚀 Starting targeted OnePrep question fetching...');
  
  const questions = [];
  
  try {
    // Step 1: Get the main question bank page
    console.log('1. Fetching main question bank page...');
    const questionBankUrl = `${ONEPREP_CONFIG.baseUrl}/question-set/sat-suite-question-bank/`;
    const response = await axios.get(questionBankUrl, {
      headers: ONEPREP_CONFIG.headers,
      timeout: 15000,
    });
    
    const $ = cheerio.load(response.data);
    
    // Step 2: Extract question links from the page
    const questionLinks = [];
    $('a[href*="question"]').each((index, link) => {
      const href = $(link).attr('href');
      if (href && href.includes('question')) {
        questionLinks.push(href);
      }
    });
    
    console.log(`✅ Found ${questionLinks.length} question links`);
    
    // Step 3: Fetch individual questions
    console.log('2. Fetching individual questions...');
    let questionCount = 0;
    
    for (let i = 1; i <= 50; i++) { // Try first 50 questions
      try {
        const questionUrl = `${ONEPREP_CONFIG.baseUrl}/question/${i}/`;
        console.log(`  Fetching question ${i}: ${questionUrl}`);
        
        const questionResponse = await axios.get(questionUrl, {
          headers: ONEPREP_CONFIG.headers,
          timeout: 10000,
        });
        
        const $question = cheerio.load(questionResponse.data);
        const questionData = extractQuestionFromPage($question, questionUrl, i);
        
        if (questionData && questionData.question) {
          questions.push(questionData);
          questionCount++;
          console.log(`    ✅ Found question ${i}: ${questionData.question.substring(0, 50)}...`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`    ❌ Failed to fetch question ${i}: ${error.message}`);
        // If we get too many failures in a row, stop
        if (i > 10 && questions.length === 0) {
          console.log('    ⚠️  No questions found after 10 attempts, stopping...');
          break;
        }
      }
    }
    
    // Step 4: Try question-set pages
    console.log('3. Fetching from question-set pages...');
    const questionSetUrls = [
      `${ONEPREP_CONFIG.baseUrl}/question-set/first-question/?question_set=sat-suite-question-bank&module=math`,
      `${ONEPREP_CONFIG.baseUrl}/question-set/first-question/?question_set=sat-suite-question-bank&module=reading`,
      `${ONEPREP_CONFIG.baseUrl}/question-set/first-question/?question_set=sat-suite-question-bank&module=writing`,
    ];
    
    for (const url of questionSetUrls) {
      try {
        console.log(`  Fetching question set: ${url}`);
        const setResponse = await axios.get(url, {
          headers: ONEPREP_CONFIG.headers,
          timeout: 10000,
        });
        
        const $set = cheerio.load(setResponse.data);
        const setQuestions = extractQuestionsFromPage($set, url);
        
        if (setQuestions.length > 0) {
          questions.push(...setQuestions);
          console.log(`    ✅ Found ${setQuestions.length} questions from ${url}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`    ❌ Failed to fetch question set ${url}: ${error.message}`);
      }
    }
    
    console.log(`🎉 Successfully fetched ${questions.length} questions!`);
    return questions;
    
  } catch (error) {
    console.error('❌ Error fetching questions:', error.message);
    return [];
  }
}

/**
 * Extract question data from a page
 */
function extractQuestionFromPage($, url, questionNumber = null) {
  // Look for question content in various selectors
  const questionSelectors = [
    '.question-content',
    '.question-text',
    '.question',
    '[data-question]',
    '.problem',
    '.content',
    'h1',
    'h2',
    'h3',
    'p'
  ];
  
  let questionText = '';
  let options = [];
  let correctAnswer = '';
  let explanation = '';
  
  // Extract question text
  for (const selector of questionSelectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      const text = element.text().trim();
      if (text && text.length > 10 && text.length < 1000) {
        questionText = text;
        break;
      }
    }
  }
  
  // If no question text found, try to extract from the page title or meta
  if (!questionText) {
    questionText = $('title').text().trim() || $('meta[name="description"]').attr('content') || '';
  }
  
  // Extract options
  $('.option, .choice, .answer, [data-option]').each((index, element) => {
    const optionText = $(element).text().trim();
    if (optionText && optionText.length > 0) {
      options.push(optionText);
    }
  });
  
  // Extract correct answer
  $('.correct-answer, .answer, [data-correct]').each((index, element) => {
    const answerText = $(element).text().trim();
    if (answerText && answerText.length > 0) {
      correctAnswer = answerText;
    }
  });
  
  // Extract explanation
  $('.explanation, .solution, .rationale').each((index, element) => {
    const explanationText = $(element).text().trim();
    if (explanationText && explanationText.length > 0) {
      explanation = explanationText;
    }
  });
  
  // Determine module from URL
  const module = determineModuleFromUrl(url);
  
  // Determine difficulty (default to medium)
  const difficulty = 'M';
  
  if (questionText && questionText.length > 10) {
    return {
      id: `oneprep-${questionNumber || Date.now()}`,
      question: questionText,
      options: options.length > 0 ? options : [],
      correct_answer: correctAnswer,
      explanation: explanation,
      difficulty: difficulty,
      module: module,
      source: 'oneprep',
      url: url,
    };
  }
  
  return null;
}

/**
 * Extract multiple questions from a page
 */
function extractQuestionsFromPage($, url) {
  const questions = [];
  
  // Look for multiple questions on the page
  $('.question, [data-question], .question-content').each((index, element) => {
    const $question = $(element);
    const questionData = extractQuestionFromElement($question, url, index);
    
    if (questionData && questionData.question) {
      questions.push(questionData);
    }
  });
  
  return questions;
}

/**
 * Extract question from a specific element
 */
function extractQuestionFromElement($question, url, index = null) {
  const questionText = $question.find('.question-text, .question-content, .content, p').first().text().trim();
  
  if (!questionText || questionText.length < 10) {
    return null;
  }
  
  const options = [];
  $question.find('.option, .choice, .answer').each((i, opt) => {
    const optionText = $question(opt).text().trim();
    if (optionText) {
      options.push(optionText);
    }
  });
  
  const correctAnswer = $question.find('.correct-answer, .answer').text().trim();
  const explanation = $question.find('.explanation, .solution').text().trim();
  
  return {
    id: `oneprep-${index || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    question: questionText,
    options: options,
    correct_answer: correctAnswer,
    explanation: explanation,
    difficulty: 'M',
    module: determineModuleFromUrl(url),
    source: 'oneprep',
    url: url,
  };
}

/**
 * Determine module from URL
 */
function determineModuleFromUrl(url) {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('module=math') || urlLower.includes('math')) {
    return 'math';
  }
  if (urlLower.includes('module=reading') || urlLower.includes('reading') || urlLower.includes('en')) {
    return 'reading';
  }
  if (urlLower.includes('module=writing') || urlLower.includes('writing')) {
    return 'writing';
  }
  
  return 'math'; // Default
}

/**
 * Transform questions to Prepify format
 */
function transformToPrepifyFormat(questions) {
  console.log('🔄 Transforming questions to Prepify format...');
  
  const uniqueQuestions = new Map();
  
  questions.forEach((question, index) => {
    const key = question.question?.substring(0, 100) || question.id;
    
    if (!uniqueQuestions.has(key)) {
      uniqueQuestions.set(key, {
        question_id: question.id || `oneprep-${index}`,
        external_id: null,
        skill_cd: '',
        skill_desc: '',
        primary_class_cd: '',
        primary_class_cd_desc: '',
        difficulty: question.difficulty || 'M',
        module: question.module || 'math',
        content: {
          keys: [],
          rationale: '',
          question: question.question || question.content || '',
          options: question.options || question.choices || [],
          correct_answer: question.correct_answer || question.answer || '',
          explanation: question.explanation || '',
        },
        program: 'SAT',
        score_band_range_cd: 5,
        active: true,
      });
    }
  });
  
  return Array.from(uniqueQuestions.values());
}

/**
 * Import questions to Supabase
 */
async function importQuestionsToSupabase(questions, sourceName) {
  console.log(`📤 Importing ${questions.length} questions from ${sourceName}...`);
  
  const batchSize = 1000;
  let insertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    
    console.log(`📤 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(questions.length / batchSize)}...`);
    
    const { data, error } = await supabase
      .from('questions')
      .upsert(batch, {
        onConflict: 'question_id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('❌ Error inserting batch:', error);
      errorCount += batch.length;
    } else {
      insertedCount += data?.length || batch.length;
      console.log(`✅ Inserted ${data?.length || batch.length} questions`);
    }
  }

  return { insertedCount, errorCount };
}

/**
 * Main function
 */
async function scrapeOnePrepTargeted() {
  try {
    console.log('🚀 Starting targeted OnePrep scraping...');
    
    const questions = await fetchOnePrepQuestions();
    
    if (questions.length === 0) {
      console.error('❌ No questions found from OnePrep!');
      console.log('Possible reasons:');
      console.log('1. OnePrep site requires authentication');
      console.log('2. Site structure changed');
      console.log('3. Rate limiting or blocking');
      console.log('4. Network connectivity issues');
      return;
    }
    
    console.log(`📊 Total questions found: ${questions.length}`);
    
    // Transform to Prepify format
    const prepifyQuestions = transformToPrepifyFormat(questions);
    console.log(`🔄 Transformed to ${prepifyQuestions.length} unique questions`);
    
    // Save to local file
    const outputPath = path.join(__dirname, 'data', 'oneprep-targeted-questions.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(prepifyQuestions, null, 2));
    console.log(`💾 Saved questions to: ${outputPath}`);
    
    // Import to Supabase
    const { insertedCount, errorCount } = await importQuestionsToSupabase(prepifyQuestions, 'OnePrep Targeted');
    
    console.log('\n🎉 Targeted scraping completed!');
    console.log(`✅ Successfully imported: ${insertedCount} questions`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount} questions`);
    }
    
    // Get statistics
    const { data: stats } = await supabase
      .from('questions')
      .select('module, difficulty')
      .eq('active', true);
    
    if (stats) {
      const moduleStats = {};
      const difficultyStats = {};
      
      stats.forEach((q) => {
        moduleStats[q.module] = (moduleStats[q.module] || 0) + 1;
        difficultyStats[q.difficulty] = (difficultyStats[q.difficulty] || 0) + 1;
      });

      console.log('\n📊 Final Statistics:');
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
    console.error('❌ Targeted scraping failed:', error);
    process.exit(1);
  }
}

// Check if required packages are installed
try {
  require('axios');
  require('cheerio');
} catch (error) {
  console.error('❌ Missing required packages. Install with:');
  console.log('npm install axios cheerio');
  process.exit(1);
}

// Run the targeted scraper
scrapeOnePrepTargeted(); 