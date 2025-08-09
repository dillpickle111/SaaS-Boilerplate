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

// Advanced OnePrep scraper configuration
const ONEPREP_CONFIG = {
  baseUrl: 'https://oneprep.xyz',
  apiBaseUrl: 'https://api.oneprep.xyz',
  endpoints: {
    questions: '/api/v1/questions',
    practice: '/api/v1/practice',
    categories: '/api/v1/categories',
    search: '/api/v1/search',
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
};

/**
 * Advanced question fetcher with multiple strategies
 */
async function fetchOnePrepQuestionsAdvanced() {
  console.log('🚀 Starting advanced OnePrep question fetching...');

  const questions = [];
  const strategies = [
    fetchFromAPI,
    fetchFromPracticePages,
    fetchFromQuestionSets,
    fetchFromSearchAPI,
    fetchFromSitemap,
  ];

  for (const strategy of strategies) {
    try {
      console.log(`\n🔍 Trying strategy: ${strategy.name}...`);
      const strategyQuestions = await strategy();

      if (strategyQuestions && strategyQuestions.length > 0) {
        questions.push(...strategyQuestions);
        console.log(`✅ Strategy ${strategy.name} found ${strategyQuestions.length} questions`);

        // If we got a good number of questions, we can stop
        if (questions.length > 100) {
          console.log('🎯 Sufficient questions found, stopping...');
          break;
        }
      }
    } catch (error) {
      console.log(`⚠️  Strategy ${strategy.name} failed: ${error.message}`);
    }
  }

  return questions;
}

/**
 * Strategy 1: Fetch from API endpoints
 */
async function fetchFromAPI() {
  const questions = [];
  const apiEndpoints = [
    `${ONEPREP_CONFIG.apiBaseUrl}/questions`,
    `${ONEPREP_CONFIG.baseUrl}/api/questions`,
    `${ONEPREP_CONFIG.baseUrl}/api/v1/questions`,
    `${ONEPREP_CONFIG.baseUrl}/api/practice/questions`,
  ];

  for (const endpoint of apiEndpoints) {
    try {
      console.log(`  Trying API endpoint: ${endpoint}`);

      const response = await axios.get(endpoint, {
        headers: ONEPREP_CONFIG.headers,
        timeout: 15000,
        params: {
          limit: 1000,
          type: 'sat',
          format: 'json',
        },
      });

      if (response.data) {
        const data = response.data;
        let extractedQuestions = [];

        // Handle different response formats
        if (Array.isArray(data)) {
          extractedQuestions = data;
        } else if (data.questions) {
          extractedQuestions = data.questions;
        } else if (data.data) {
          extractedQuestions = data.data;
        } else if (data.results) {
          extractedQuestions = data.results;
        }

        if (extractedQuestions.length > 0) {
          questions.push(...extractedQuestions);
          console.log(`  ✅ Found ${extractedQuestions.length} questions from ${endpoint}`);
          break; // Success, stop trying other endpoints
        }
      }
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
  }

  return questions;
}

/**
 * Strategy 2: Fetch from practice pages
 */
async function fetchFromPracticePages() {
  const questions = [];
  const practiceUrls = [
    `${ONEPREP_CONFIG.baseUrl}/question-set/sat-suite-question-bank/`,
    `${ONEPREP_CONFIG.baseUrl}/question-set/first-question/?question_set=sat-suite-question-bank&module=math`,
    `${ONEPREP_CONFIG.baseUrl}/question-set/first-question/?question_set=sat-suite-question-bank&module=reading`,
    `${ONEPREP_CONFIG.baseUrl}/question-set/first-question/?question_set=sat-suite-question-bank&module=writing`,
    `${ONEPREP_CONFIG.baseUrl}/question/1/`,
    `${ONEPREP_CONFIG.baseUrl}/question/2/`,
    `${ONEPREP_CONFIG.baseUrl}/question/3/`,
    `${ONEPREP_CONFIG.baseUrl}/question/4/`,
    `${ONEPREP_CONFIG.baseUrl}/question/5/`,
  ];

  for (const url of practiceUrls) {
    try {
      console.log(`  Scraping practice page: ${url}`);

      const response = await axios.get(url, {
        headers: ONEPREP_CONFIG.headers,
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Look for questions in various formats
      const questionSelectors = [
        '[data-question]',
        '.question',
        '.practice-question',
        '.sat-question',
        '.question-container',
        '.question-item',
        '.problem',
        '.quiz-question',
        '.question-content',
        '.question-text',
      ];

      $(questionSelectors.join(', ')).each((index, element) => {
        const $question = $(element);
        const questionData = extractQuestionFromElement($question, url);

        if (questionData && questionData.question) {
          questions.push(questionData);
        }
      });

      // Also look for JSON data embedded in scripts
      $('script[type="application/json"], script[type="application/ld+json"]').each((index, script) => {
        try {
          const scriptContent = $(script).html();
          if (scriptContent) {
            const jsonData = JSON.parse(scriptContent);
            const embeddedQuestions = extractQuestionsFromJSON(jsonData);
            questions.push(...embeddedQuestions);
          }
        } catch (error) {
          // Ignore JSON parsing errors
        }
      });

      // Look for question data in meta tags or data attributes
      $('[data-question-id], [data-question-text], [data-options]').each((index, element) => {
        const $element = $(element);
        const questionId = $element.attr('data-question-id') || $element.attr('id');
        const questionText = $element.attr('data-question-text') || $element.text().trim();

        if (questionText && questionText.length > 10) {
          questions.push({
            id: questionId || `scraped-${Date.now()}-${index}`,
            question: questionText,
            options: [],
            correct_answer: '',
            explanation: '',
            difficulty: 'M',
            module: determineModuleFromUrl(url),
            source: 'scraped',
            url,
          });
        }
      });

      if (questions.length > 0) {
        console.log(`  ✅ Found ${questions.length} questions from ${url}`);
        break;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.log(`  ❌ Failed to scrape ${url}: ${error.message}`);
    }
  }

  return questions;
}

/**
 * Strategy 3: Fetch from search API
 */
async function fetchFromSearchAPI() {
  const questions = [];
  const searchTerms = ['sat', 'math', 'reading', 'writing', 'algebra', 'geometry'];

  for (const term of searchTerms) {
    try {
      console.log(`  Searching for: ${term}`);

      const searchUrl = `${ONEPREP_CONFIG.baseUrl}/api/search?q=${encodeURIComponent(term)}&type=question`;
      const response = await axios.get(searchUrl, {
        headers: ONEPREP_CONFIG.headers,
        timeout: 10000,
      });

      if (response.data && response.data.results) {
        questions.push(...response.data.results);
        console.log(`  ✅ Found ${response.data.results.length} questions for "${term}"`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`  ❌ Search failed for "${term}": ${error.message}`);
    }
  }

  return questions;
}

/**
 * Strategy 4: Fetch from sitemap
 */
async function fetchFromSitemap() {
  const questions = [];

  try {
    console.log('  Fetching sitemap...');

    const sitemapUrl = `${ONEPREP_CONFIG.baseUrl}/sitemap.xml`;
    const response = await axios.get(sitemapUrl, {
      headers: ONEPREP_CONFIG.headers,
      timeout: 10000,
    });

    const $ = cheerio.load(response.data, { xmlMode: true });

    // Extract URLs that might contain questions
    const questionUrls = [];
    $('url').each((index, element) => {
      const $url = $(element);
      const loc = $url.find('loc').text();

      if (loc && (loc.includes('question') || loc.includes('question-set') || loc.includes('practice'))) {
        questionUrls.push(loc);
      }
    });

    console.log(`  Found ${questionUrls.length} potential question URLs in sitemap`);

    // Fetch questions from these URLs (limit to first 10 to avoid overwhelming)
    for (let i = 0; i < Math.min(questionUrls.length, 10); i++) {
      try {
        const questionUrl = questionUrls[i];
        console.log(`    Fetching: ${questionUrl}`);

        const questionResponse = await axios.get(questionUrl, {
          headers: ONEPREP_CONFIG.headers,
          timeout: 10000,
        });

        const $question = cheerio.load(questionResponse.data);
        const questionData = extractQuestionFromElement($question, questionUrl);

        if (questionData && questionData.question) {
          questions.push(questionData);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`    ❌ Failed to fetch ${questionUrls[i]}: ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`  ❌ Sitemap fetch failed: ${error.message}`);
  }

  return questions;
}

/**
 * Strategy 5: Fetch from question-set pages
 */
async function fetchFromQuestionSets() {
  const questions = [];

  try {
    console.log('  Fetching from question sets...');

    // Try to fetch the main question bank page
    const questionBankUrl = `${ONEPREP_CONFIG.baseUrl}/question-set/sat-suite-question-bank/`;
    const response = await axios.get(questionBankUrl, {
      headers: ONEPREP_CONFIG.headers,
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Look for question links or data
    $('a[href*="question"], a[href*="question-set"]').each((index, link) => {
      const href = $(link).attr('href');
      if (href && href.includes('question')) {
        console.log(`    Found question link: ${href}`);
      }
    });

    // Look for question data in the page
    $('.question, [data-question], .question-content').each((index, element) => {
      const $question = $(element);
      const questionData = extractQuestionFromElement($question, questionBankUrl);

      if (questionData && questionData.question) {
        questions.push(questionData);
      }
    });

    // Try to fetch individual questions
    for (let i = 1; i <= 10; i++) {
      try {
        const questionUrl = `${ONEPREP_CONFIG.baseUrl}/question/${i}/`;
        console.log(`    Fetching question ${i}: ${questionUrl}`);

        const questionResponse = await axios.get(questionUrl, {
          headers: ONEPREP_CONFIG.headers,
          timeout: 10000,
        });

        const $question = cheerio.load(questionResponse.data);
        const questionData = extractQuestionFromElement($question, questionUrl);

        if (questionData && questionData.question) {
          questions.push(questionData);
          console.log(`    ✅ Found question ${i}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`    ❌ Failed to fetch question ${i}: ${error.message}`);
        break; // Stop if we can't fetch questions
      }
    }
  } catch (error) {
    console.log(`  ❌ Question set fetch failed: ${error.message}`);
  }

  return questions;
}

/**
 * Extract question data from a DOM element
 */
function extractQuestionFromElement($question, sourceUrl) {
  // Extract question text
  const questionText = $question.find('.question-text, .question-content, .problem-text, .content, p').first().text().trim();

  if (!questionText || questionText.length < 10) {
    return null;
  }

  // Extract options
  const options = [];
  $question.find('.option, .choice, .answer-choice, [data-option], .answer').each((i, opt) => {
    const optionText = $question(opt).text().trim();
    if (optionText && optionText.length > 0) {
      options.push(optionText);
    }
  });

  // Extract correct answer
  const correctAnswer = $question.find('.correct-answer, .answer, [data-correct], .solution').text().trim();

  // Extract explanation
  const explanation = $question.find('.explanation, .solution, .rationale, .hint').text().trim();

  // Determine difficulty and module
  const difficulty = determineDifficulty($question);
  const module = determineModule($question, sourceUrl);

  return {
    id: `scraped-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    question: questionText,
    options,
    correct_answer: correctAnswer,
    explanation,
    difficulty,
    module,
    source: 'scraped',
    url: sourceUrl,
  };
}

/**
 * Extract questions from JSON data
 */
function extractQuestionsFromJSON(jsonData) {
  const questions = [];

  if (Array.isArray(jsonData)) {
    jsonData.forEach((item) => {
      if (item.question || item.content || item.text) {
        questions.push({
          id: item.id || `json-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          question: item.question || item.content || item.text,
          options: item.options || item.choices || [],
          correct_answer: item.correct_answer || item.answer || '',
          explanation: item.explanation || item.solution || '',
          difficulty: item.difficulty || 'M',
          module: item.module || 'math',
          source: 'json',
        });
      }
    });
  } else if (jsonData.questions) {
    questions.push(...extractQuestionsFromJSON(jsonData.questions));
  } else if (jsonData.data) {
    questions.push(...extractQuestionsFromJSON(jsonData.data));
  }

  return questions;
}

/**
 * Determine question difficulty
 */
function determineDifficulty($question) {
  const difficultyText = $question.find('.difficulty, .level, [data-difficulty], .badge').text().toLowerCase();

  if (difficultyText.includes('easy') || difficultyText.includes('1') || difficultyText.includes('beginner')) {
    return 'E';
  }
  if (difficultyText.includes('hard') || difficultyText.includes('3') || difficultyText.includes('advanced')) {
    return 'H';
  }
  return 'M';
}

/**
 * Determine question module
 */
function determineModule($question, url) {
  const moduleText = $question.find('.module, .subject, .category, .tag').text().toLowerCase();
  const urlLower = url.toLowerCase();

  if (moduleText.includes('reading') || urlLower.includes('reading')) {
    return 'reading';
  }
  if (moduleText.includes('writing') || urlLower.includes('writing')) {
    return 'writing';
  }
  if (moduleText.includes('math') || urlLower.includes('math')) {
    return 'math';
  }

  // Default based on URL
  if (urlLower.includes('reading')) {
    return 'reading';
  }
  if (urlLower.includes('writing')) {
    return 'writing';
  }
  return 'math';
}

/**
 * Determine module from URL
 */
function determineModuleFromUrl(url) {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('module=math') || urlLower.includes('math')) {
    return 'math';
  }
  if (urlLower.includes('module=reading') || urlLower.includes('reading')) {
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
async function scrapeOnePrepAdvanced() {
  try {
    console.log('🚀 Starting advanced OnePrep scraping...');

    const questions = await fetchOnePrepQuestionsAdvanced();

    if (questions.length === 0) {
      console.error('❌ No questions found from OnePrep!');
      console.log('Possible reasons:');
      console.log('1. OnePrep site structure changed');
      console.log('2. Rate limiting or blocking');
      console.log('3. Network connectivity issues');
      console.log('4. Site requires authentication');
      console.log('5. Site uses JavaScript rendering');
      return;
    }

    console.log(`📊 Total questions found: ${questions.length}`);

    // Transform to Prepify format
    const prepifyQuestions = transformToPrepifyFormat(questions);
    console.log(`🔄 Transformed to ${prepifyQuestions.length} unique questions`);

    // Save to local file
    const outputPath = path.join(__dirname, 'data', 'oneprep-advanced-questions.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(prepifyQuestions, null, 2));
    console.log(`💾 Saved questions to: ${outputPath}`);

    // Import to Supabase
    const { insertedCount, errorCount } = await importQuestionsToSupabase(prepifyQuestions, 'OnePrep Advanced');

    console.log('\n🎉 Advanced scraping completed!');
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
    console.error('❌ Advanced scraping failed:', error);
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

// Run the advanced scraper
scrapeOnePrepAdvanced();
