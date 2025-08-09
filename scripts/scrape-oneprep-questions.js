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
  console.log('Please add to your .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (for import)');
  process.exit(1);
}

// Use service role key for import (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// OnePrep site configuration
const ONEPREP_CONFIG = {
  baseUrl: 'https://oneprep.xyz',
  endpoints: {
    questions: '/api/questions',
    categories: '/api/categories',
    practice: '/api/practice',
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  },
};

/**
 * Fetch questions from OnePrep's API endpoints
 */
async function fetchOnePrepQuestions() {
  console.log('🌐 Fetching questions from OnePrep live site...');

  const questions = [];
  let page = 1;
  const limit = 100;

  try {
    while (true) {
      console.log(`📄 Fetching page ${page}...`);

      // Try different API endpoints
      const endpoints = [
        `${ONEPREP_CONFIG.baseUrl}/api/questions?page=${page}&limit=${limit}`,
        `${ONEPREP_CONFIG.baseUrl}/api/practice/questions?page=${page}&limit=${limit}`,
        `${ONEPREP_CONFIG.baseUrl}/api/sat/questions?page=${page}&limit=${limit}`,
        `${ONEPREP_CONFIG.baseUrl}/questions?page=${page}&limit=${limit}`,
      ];

      let response = null;
      let endpointUsed = '';

      for (const endpoint of endpoints) {
        try {
          console.log(`  Trying endpoint: ${endpoint}`);
          response = await axios.get(endpoint, {
            headers: ONEPREP_CONFIG.headers,
            timeout: 10000,
          });
          endpointUsed = endpoint;
          break;
        } catch (error) {
          console.log(`  ❌ Failed: ${error.message}`);
          continue;
        }
      }

      if (!response) {
        console.log('❌ All API endpoints failed, trying web scraping...');
        break;
      }

      const data = response.data;
      console.log(`✅ Successfully fetched from: ${endpointUsed}`);

      // Handle different response formats
      let pageQuestions = [];
      if (Array.isArray(data)) {
        pageQuestions = data;
      } else if (data.questions && Array.isArray(data.questions)) {
        pageQuestions = data.questions;
      } else if (data.data && Array.isArray(data.data)) {
        pageQuestions = data.data;
      } else if (data.results && Array.isArray(data.results)) {
        pageQuestions = data.results;
      } else {
        console.log('⚠️  Unexpected response format:', typeof data);
        console.log('Response keys:', Object.keys(data));
        break;
      }

      if (pageQuestions.length === 0) {
        console.log('📄 No more questions found, stopping...');
        break;
      }

      questions.push(...pageQuestions);
      console.log(`✅ Added ${pageQuestions.length} questions from page ${page}`);

      page++;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`🎉 Successfully fetched ${questions.length} questions from OnePrep!`);
    return questions;
  } catch (error) {
    console.error('❌ Error fetching questions:', error.message);
    return [];
  }
}

/**
 * Scrape questions from OnePrep's web pages
 */
async function scrapeOnePrepQuestions() {
  console.log('🕷️  Scraping questions from OnePrep web pages...');

  const questions = [];
  const visitedUrls = new Set();

  try {
    // Start with main practice page
    const startUrls = [
      `${ONEPREP_CONFIG.baseUrl}/practice`,
      `${ONEPREP_CONFIG.baseUrl}/sat-practice`,
      `${ONEPREP_CONFIG.baseUrl}/questions`,
      `${ONEPREP_CONFIG.baseUrl}/math-practice`,
      `${ONEPREP_CONFIG.baseUrl}/reading-practice`,
      `${ONEPREP_CONFIG.baseUrl}/writing-practice`,
    ];

    for (const startUrl of startUrls) {
      try {
        console.log(`🔍 Scraping: ${startUrl}`);
        const response = await axios.get(startUrl, {
          headers: ONEPREP_CONFIG.headers,
          timeout: 10000,
        });

        const $ = cheerio.load(response.data);

        // Look for question containers
        const questionSelectors = [
          '.question-container',
          '.question-item',
          '.practice-question',
          '.sat-question',
          '[data-question]',
          '.question',
          '.problem',
        ];

        for (const selector of questionSelectors) {
          $(selector).each((index, element) => {
            const $question = $(element);

            // Extract question text
            const questionText = $question.find('.question-text, .question-content, .problem-text, p').first().text().trim();

            if (questionText && questionText.length > 10) {
              // Extract options
              const options = [];
              $question.find('.option, .choice, .answer-choice, [data-option]').each((i, opt) => {
                const optionText = $(opt).text().trim();
                if (optionText) {
                  options.push(optionText);
                }
              });

              // Extract correct answer
              const correctAnswer = $question.find('.correct-answer, .answer, [data-correct]').text().trim();

              // Extract explanation
              const explanation = $question.find('.explanation, .solution, .rationale').text().trim();

              // Determine difficulty and module
              const difficulty = determineDifficulty($question);
              const module = determineModule($question, startUrl);

              questions.push({
                id: `scraped-${questions.length + 1}`,
                question: questionText,
                options: options.length > 0 ? options : [],
                correct_answer: correctAnswer || '',
                explanation: explanation || '',
                difficulty,
                module,
                source: 'scraped',
              });
            }
          });
        }

        // Look for links to more questions
        $('a[href*="question"], a[href*="practice"], a[href*="problem"]').each((index, link) => {
          const href = $(link).attr('href');
          if (href && !visitedUrls.has(href)) {
            visitedUrls.add(href);
            // Could recursively scrape these URLs
          }
        });

        await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
      } catch (error) {
        console.log(`⚠️  Failed to scrape ${startUrl}: ${error.message}`);
      }
    }

    console.log(`🎉 Successfully scraped ${questions.length} questions!`);
    return questions;
  } catch (error) {
    console.error('❌ Error scraping questions:', error.message);
    return [];
  }
}

/**
 * Determine question difficulty from DOM elements
 */
function determineDifficulty($question) {
  const difficultyText = $question.find('.difficulty, .level, [data-difficulty]').text().toLowerCase();

  if (difficultyText.includes('easy') || difficultyText.includes('1')) {
    return 'E';
  }
  if (difficultyText.includes('hard') || difficultyText.includes('3')) {
    return 'H';
  }
  return 'M'; // Default to medium
}

/**
 * Determine question module from DOM elements or URL
 */
function determineModule($question, url) {
  const moduleText = $question.find('.module, .subject, .category, [data-module]').text().toLowerCase();
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
 * Transform scraped questions to Prepify format
 */
function transformToPrepifyFormat(questions) {
  console.log('🔄 Transforming questions to Prepify format...');

  return questions.map((question, index) => ({
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
  }));
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
 * Main scraping function
 */
async function scrapeOnePrep() {
  try {
    console.log('🚀 Starting OnePrep question scraping...');

    const allQuestions = [];

    // Try API first
    console.log('1. Attempting API fetch...');
    const apiQuestions = await fetchOnePrepQuestions();
    if (apiQuestions.length > 0) {
      allQuestions.push(...apiQuestions);
      console.log(`✅ Fetched ${apiQuestions.length} questions via API`);
    } else {
      console.log('⚠️  API fetch failed, trying web scraping...');
    }

    // Try web scraping if API failed
    if (allQuestions.length === 0) {
      console.log('2. Attempting web scraping...');
      const scrapedQuestions = await scrapeOnePrepQuestions();
      if (scrapedQuestions.length > 0) {
        allQuestions.push(...scrapedQuestions);
        console.log(`✅ Scraped ${scrapedQuestions.length} questions via web scraping`);
      }
    }

    if (allQuestions.length === 0) {
      console.error('❌ No questions found from OnePrep!');
      console.log('Possible reasons:');
      console.log('1. OnePrep site structure changed');
      console.log('2. Rate limiting or blocking');
      console.log('3. Network connectivity issues');
      console.log('4. Site requires authentication');
      return;
    }

    console.log(`📊 Total questions found: ${allQuestions.length}`);

    // Transform to Prepify format
    const prepifyQuestions = transformToPrepifyFormat(allQuestions);

    // Save to local file first
    const outputPath = path.join(__dirname, 'data', 'oneprep-latest-questions.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(prepifyQuestions, null, 2));
    console.log(`💾 Saved questions to: ${outputPath}`);

    // Import to Supabase
    const { insertedCount, errorCount } = await importQuestionsToSupabase(prepifyQuestions, 'OnePrep Live');

    console.log('\n🎉 Scraping completed!');
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
    console.error('❌ Scraping failed:', error);
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

// Run the scraper
scrapeOnePrep();
