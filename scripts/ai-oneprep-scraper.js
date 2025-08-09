const fs = require('node:fs');
const path = require('node:path');
const { createClient } = require('@supabase/supabase-js');
const { chromium } = require('playwright');

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
  startUrl: 'https://oneprep.xyz/question-set/sat-suite-question-bank/',
  maxPages: 1000, // Maximum pages to scan
  maxQuestions: 5000, // Maximum questions to extract
  delay: 1000, // Delay between requests (ms)
  timeout: 30000, // Page timeout (ms)
};

/**
 * AI-powered OnePrep scraper using Playwright
 */
class AIOnePrepScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.questions = [];
    this.visitedUrls = new Set();
    this.questionUrls = new Set();
    this.failedUrls = new Set();
    this.stats = {
      pagesScanned: 0,
      questionsFound: 0,
      errors: 0,
      startTime: Date.now(),
    };
  }

  /**
   * Initialize the browser
   */
  async initialize() {
    console.log('🚀 Initializing AI-powered OnePrep scraper...');

    this.browser = await chromium.launch({
      headless: false, // Set to true for production
      slowMo: 100, // Slow down for better reliability
    });

    this.page = await this.browser.newPage();

    // Set user agent and viewport
    await this.page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    await this.page.setViewportSize({ width: 1920, height: 1080 });

    // Enable request interception for better performance
    await this.page.route('**/*.{png,jpg,jpeg,gif,svg,css,woff,woff2}', route => route.abort());

    console.log('✅ Browser initialized successfully!');
  }

  /**
   * Main scraping function
   */
  async scrape() {
    try {
      await this.initialize();

      console.log('🔍 Starting AI-powered scraping...');

      // Step 1: Discover all question URLs
      await this.discoverQuestionUrls();

      // Step 2: Extract questions from discovered URLs
      await this.extractQuestions();

      // Step 3: Save and import results
      await this.saveResults();
    } catch (error) {
      console.error('❌ Scraping failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Discover all question URLs on the site
   */
  async discoverQuestionUrls() {
    console.log('1. 🔍 Discovering question URLs...');

    const urlsToVisit = [ONEPREP_CONFIG.startUrl];
    let currentIndex = 0;

    while (currentIndex < urlsToVisit.length && currentIndex < ONEPREP_CONFIG.maxPages) {
      const url = urlsToVisit[currentIndex];

      if (this.visitedUrls.has(url)) {
        currentIndex++;
        continue;
      }

      try {
        console.log(`  Scanning: ${url}`);
        this.visitedUrls.add(url);
        this.stats.pagesScanned++;

        // Navigate to the page
        await this.page.goto(url, { waitUntil: 'networkidle', timeout: ONEPREP_CONFIG.timeout });

        // Wait for content to load
        await this.page.waitForTimeout(2000);

        // Extract question URLs from this page
        const newUrls = await this.extractUrlsFromPage();

        // Add new URLs to the queue
        for (const newUrl of newUrls) {
          if (!this.visitedUrls.has(newUrl) && !urlsToVisit.includes(newUrl)) {
            urlsToVisit.push(newUrl);
          }
        }

        // Check if this page contains questions
        if (await this.pageHasQuestions()) {
          this.questionUrls.add(url);
          console.log(`    ✅ Found questions on: ${url}`);
        }

        // Rate limiting
        await this.page.waitForTimeout(ONEPREP_CONFIG.delay);
      } catch (error) {
        console.log(`    ❌ Failed to scan ${url}: ${error.message}`);
        this.failedUrls.add(url);
        this.stats.errors++;
      }

      currentIndex++;
    }

    console.log(`✅ Discovered ${this.questionUrls.size} question URLs from ${this.stats.pagesScanned} pages`);
  }

  /**
   * Extract URLs from the current page
   */
  async extractUrlsFromPage() {
    const urls = await this.page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      const urls = new Set();

      links.forEach((link) => {
        const href = link.href;
        if (href && (
          href.includes('question')
          || href.includes('question-set')
          || href.includes('practice')
          || href.includes('sat')
        )) {
          urls.add(href);
        }
      });

      return Array.from(urls);
    });

    return urls;
  }

  /**
   * Check if the current page contains questions
   */
  async pageHasQuestions() {
    return await this.page.evaluate(() => {
      const questionSelectors = [
        '.question',
        '[data-question]',
        '.question-content',
        '.question-text',
        '.problem',
        '.quiz-question',
        '.practice-question',
      ];

      for (const selector of questionSelectors) {
        if (document.querySelector(selector)) {
          return true;
        }
      }

      // Check for question-related text
      const bodyText = document.body.textContent.toLowerCase();
      const questionKeywords = ['question', 'problem', 'solve', 'answer', 'choose', 'select'];

      return questionKeywords.some(keyword => bodyText.includes(keyword));
    });
  }

  /**
   * Extract questions from discovered URLs
   */
  async extractQuestions() {
    console.log('2. 📝 Extracting questions from discovered URLs...');

    const questionUrlArray = Array.from(this.questionUrls);

    for (let i = 0; i < questionUrlArray.length && this.questions.length < ONEPREP_CONFIG.maxQuestions; i++) {
      const url = questionUrlArray[i];

      try {
        console.log(`  Extracting from: ${url} (${i + 1}/${questionUrlArray.length})`);

        // Navigate to the question page
        await this.page.goto(url, { waitUntil: 'networkidle', timeout: ONEPREP_CONFIG.timeout });

        // Wait for content to load
        await this.page.waitForTimeout(2000);

        // Extract questions from this page
        const pageQuestions = await this.extractQuestionsFromPage(url);

        if (pageQuestions.length > 0) {
          this.questions.push(...pageQuestions);
          this.stats.questionsFound += pageQuestions.length;
          console.log(`    ✅ Found ${pageQuestions.length} questions`);
        }

        // Rate limiting
        await this.page.waitForTimeout(ONEPREP_CONFIG.delay);
      } catch (error) {
        console.log(`    ❌ Failed to extract from ${url}: ${error.message}`);
        this.failedUrls.add(url);
        this.stats.errors++;
      }
    }

    console.log(`✅ Extracted ${this.questions.length} questions from ${questionUrlArray.length} URLs`);
  }

  /**
   * Extract questions from the current page
   */
  async extractQuestionsFromPage(url) {
    const questions = await this.page.evaluate((pageUrl) => {
      const extractedQuestions = [];

      // Function to clean text
      const cleanText = (text) => {
        return text ? text.trim().replace(/\s+/g, ' ') : '';
      };

      // Look for questions in various formats
      const questionSelectors = [
        '.question',
        '[data-question]',
        '.question-content',
        '.question-text',
        '.problem',
        '.quiz-question',
        '.practice-question',
      ];

      // Extract questions from selectors
      for (const selector of questionSelectors) {
        const elements = document.querySelectorAll(selector);

        elements.forEach((element, index) => {
          const questionText = cleanText(element.textContent);

          if (questionText && questionText.length > 10 && questionText.length < 2000) {
            // Extract options
            const options = [];
            const optionElements = element.querySelectorAll('.option, .choice, .answer, [data-option]');
            optionElements.forEach((opt) => {
              const optionText = cleanText(opt.textContent);
              if (optionText) {
                options.push(optionText);
              }
            });

            // Extract correct answer
            const correctAnswerElement = element.querySelector('.correct-answer, .answer, [data-correct]');
            const correctAnswer = correctAnswerElement ? cleanText(correctAnswerElement.textContent) : '';

            // Extract explanation
            const explanationElement = element.querySelector('.explanation, .solution, .rationale');
            const explanation = explanationElement ? cleanText(explanationElement.textContent) : '';

            extractedQuestions.push({
              id: `ai-scraped-${Date.now()}-${index}`,
              question: questionText,
              options,
              correct_answer: correctAnswer,
              explanation,
              difficulty: 'M',
              module: determineModuleFromUrl(pageUrl),
              source: 'ai-scraped',
              url: pageUrl,
            });
          }
        });
      }

      // If no questions found in selectors, try to extract from page content
      if (extractedQuestions.length === 0) {
        const bodyText = document.body.textContent;
        const lines = bodyText.split('\n').map(line => line.trim()).filter(line => line.length > 10);

        // Look for question-like content
        for (const line of lines) {
          if (line.includes('?') && (line.includes('What') || line.includes('Which') || line.includes('How') || line.includes('Solve'))) {
            extractedQuestions.push({
              id: `ai-scraped-${Date.now()}-${extractedQuestions.length}`,
              question: line,
              options: [],
              correct_answer: '',
              explanation: '',
              difficulty: 'M',
              module: determineModuleFromUrl(pageUrl),
              source: 'ai-scraped',
              url: pageUrl,
            });
          }
        }
      }

      // Helper function to determine module from URL
      function determineModuleFromUrl(url) {
        const urlLower = url.toLowerCase();
        if (urlLower.includes('math')) {
          return 'math';
        }
        if (urlLower.includes('reading') || urlLower.includes('en')) {
          return 'reading';
        }
        if (urlLower.includes('writing')) {
          return 'writing';
        }
        return 'math';
      }

      return extractedQuestions;
    }, url);

    return questions;
  }

  /**
   * Save results and import to Supabase
   */
  async saveResults() {
    console.log('3. 💾 Saving results...');

    // Transform to Prepify format
    const prepifyQuestions = this.transformToPrepifyFormat(this.questions);

    // Save to local file
    const outputPath = path.join(__dirname, 'data', 'ai-oneprep-questions.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(prepifyQuestions, null, 2));
    console.log(`💾 Saved ${prepifyQuestions.length} questions to: ${outputPath}`);

    // Save statistics
    const statsPath = path.join(__dirname, 'data', 'ai-scraping-stats.json');
    const finalStats = {
      ...this.stats,
      endTime: Date.now(),
      duration: Date.now() - this.stats.startTime,
      totalQuestions: this.questions.length,
      uniqueQuestions: prepifyQuestions.length,
      visitedUrls: this.visitedUrls.size,
      questionUrls: this.questionUrls.size,
      failedUrls: this.failedUrls.size,
    };
    fs.writeFileSync(statsPath, JSON.stringify(finalStats, null, 2));
    console.log(`📊 Saved statistics to: ${statsPath}`);

    // Import to Supabase
    if (prepifyQuestions.length > 0) {
      const { insertedCount, errorCount } = await this.importToSupabase(prepifyQuestions);
      console.log(`✅ Successfully imported: ${insertedCount} questions`);
      if (errorCount > 0) {
        console.log(`❌ Errors: ${errorCount} questions`);
      }
    }
  }

  /**
   * Transform questions to Prepify format
   */
  transformToPrepifyFormat(questions) {
    console.log('🔄 Transforming questions to Prepify format...');

    const uniqueQuestions = new Map();

    questions.forEach((question, index) => {
      const key = question.question?.substring(0, 100) || question.id;

      if (!uniqueQuestions.has(key)) {
        uniqueQuestions.set(key, {
          question_id: question.id || `ai-oneprep-${index}`,
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
  async importToSupabase(questions) {
    console.log(`📤 Importing ${questions.length} questions to Supabase...`);

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
   * Cleanup resources
   */
  async cleanup() {
    console.log('🧹 Cleaning up...');

    if (this.page) {
      await this.page.close();
    }

    if (this.browser) {
      await this.browser.close();
    }

    console.log('✅ Cleanup completed!');
  }

  /**
   * Print final statistics
   */
  printStats() {
    const duration = Date.now() - this.stats.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    console.log('\n📊 Final Statistics:');
    console.log(`⏱️  Duration: ${minutes}m ${seconds}s`);
    console.log(`📄 Pages Scanned: ${this.stats.pagesScanned}`);
    console.log(`🔗 URLs Visited: ${this.visitedUrls.size}`);
    console.log(`❓ Question URLs Found: ${this.questionUrls.size}`);
    console.log(`📝 Questions Extracted: ${this.questions.length}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    console.log(`💾 Failed URLs: ${this.failedUrls.size}`);
  }
}

/**
 * Main function
 */
async function main() {
  const scraper = new AIOnePrepScraper();

  try {
    await scraper.scrape();
    scraper.printStats();
  } catch (error) {
    console.error('❌ AI scraping failed:', error);
    process.exit(1);
  }
}

// Run the AI scraper
main();
