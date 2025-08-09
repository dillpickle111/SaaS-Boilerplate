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

// Enhanced OnePrep site configuration
const ONEPREP_CONFIG = {
  baseUrl: 'https://oneprep.xyz',
  startUrl: 'https://oneprep.xyz/question-set/sat-suite-question-bank/',
  maxPages: 2000, // Increased for comprehensive scanning
  maxQuestions: 10000, // Increased for more questions
  delay: 1500, // Slightly longer delay for better reliability
  timeout: 45000, // Longer timeout for complex pages
  headless: false, // Set to true for production
  slowMo: 200, // Slower for better reliability
};

/**
 * Enhanced AI-powered OnePrep scraper using Playwright
 */
class EnhancedAIOnePrepScraper {
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
      lastProgressTime: Date.now(),
    };
  }

  /**
   * Initialize the browser with enhanced settings
   */
  async initialize() {
    console.log('🚀 Initializing Enhanced AI-powered OnePrep scraper...');

    this.browser = await chromium.launch({
      headless: ONEPREP_CONFIG.headless,
      slowMo: ONEPREP_CONFIG.slowMo,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });

    this.page = await this.browser.newPage();

    // Set user agent and viewport
    await this.page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    await this.page.setViewportSize({ width: 1920, height: 1080 });

    // Enable request interception for better performance
    await this.page.route('**/*.{png,jpg,jpeg,gif,svg,css,woff,woff2,mp4,webm}', route => route.abort());

    // Set extra headers
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });

    console.log('✅ Enhanced browser initialized successfully!');
  }

  /**
   * Main scraping function with enhanced error handling
   */
  async scrape() {
    try {
      await this.initialize();

      console.log('🔍 Starting Enhanced AI-powered scraping...');

      // Step 1: Discover all question URLs with intelligent crawling
      await this.discoverQuestionUrlsEnhanced();

      // Step 2: Extract questions from discovered URLs with AI detection
      await this.extractQuestionsEnhanced();

      // Step 3: Save and import results
      await this.saveResults();
    } catch (error) {
      console.error('❌ Enhanced scraping failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Enhanced URL discovery with intelligent crawling
   */
  async discoverQuestionUrlsEnhanced() {
    console.log('1. 🔍 Discovering question URLs with AI intelligence...');

    const urlsToVisit = [ONEPREP_CONFIG.startUrl];
    let currentIndex = 0;

    while (currentIndex < urlsToVisit.length && currentIndex < ONEPREP_CONFIG.maxPages) {
      const url = urlsToVisit[currentIndex];

      if (this.visitedUrls.has(url)) {
        currentIndex++;
        continue;
      }

      try {
        console.log(`  Scanning: ${url} (${currentIndex + 1}/${urlsToVisit.length})`);
        this.visitedUrls.add(url);
        this.stats.pagesScanned++;

        // Navigate to the page with more lenient waiting
        await this.page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });

        // Wait for content to load
        await this.page.waitForTimeout(2000);

        // Check if we need to handle authentication
        let authRequired = false;
        try {
          authRequired = await this.checkForAuthentication();
        } catch (error) {
          console.log('    ⚠️  Could not check authentication status, continuing...');
        }

        if (authRequired) {
          console.log('    🔐 Authentication required detected!');
          console.log('    📝 Please manually log in to OnePrep in the browser window.');
          console.log('    ⏳ Waiting for manual authentication... (30 seconds)');

          // Wait for manual authentication
          await this.page.waitForTimeout(30000);

          // Check if authentication was successful
          try {
            const stillAuthRequired = await this.checkForAuthentication();
            if (!stillAuthRequired) {
              console.log('    ✅ Authentication successful! Continuing...');
            } else {
              console.log('    ⚠️  Authentication still required, skipping...');
              this.failedUrls.add(url);
              currentIndex++;
              continue;
            }
          } catch (error) {
            console.log('    ✅ Authentication check completed, continuing...');
          }
        }

        // Extract ALL URLs from this page (not just question URLs)
        let newUrls = [];
        try {
          newUrls = await this.extractAllUrlsFromPage();
          console.log(`    🔗 Found ${newUrls.length} links on this page`);
        } catch (error) {
          console.log('    ⚠️  Could not extract URLs, continuing...');
        }

        // Add new URLs to the queue with intelligent filtering
        for (const newUrl of newUrls) {
          if (!this.visitedUrls.has(newUrl) && !urlsToVisit.includes(newUrl)) {
            // Only add URLs that are likely to contain questions
            if (this.isLikelyQuestionUrl(newUrl)) {
              urlsToVisit.push(newUrl);
            }
          }
        }

        // Check if this page contains questions with AI detection
        try {
          if (await this.pageHasQuestionsEnhanced()) {
            this.questionUrls.add(url);
            console.log(`    ✅ Found questions on: ${url}`);
          }
        } catch (error) {
          console.log('    ⚠️  Could not check for questions, continuing...');
        }

        // Rate limiting with progress reporting
        await this.page.waitForTimeout(ONEPREP_CONFIG.delay);
        this.reportProgress();
      } catch (error) {
        console.log(`    ❌ Failed to scan ${url}: ${error.message}`);
        this.failedUrls.add(url);
        this.stats.errors++;

        // If it's a timeout or navigation error, try a different approach
        if (error.message.includes('Timeout') || error.message.includes('navigation') || error.message.includes('destroyed')) {
          console.log('    🔄 Trying alternative approach for navigation/timeout...');
          try {
            // Wait a bit and try to continue
            await this.page.waitForTimeout(2000);

            // Check if we're still on a valid page
            const currentUrl = this.page.url();
            if (currentUrl && currentUrl.includes('oneprep')) {
              console.log('    ✅ Page navigation successful, continuing...');

              // Check if this page contains questions
              try {
                if (await this.pageHasQuestionsEnhanced()) {
                  this.questionUrls.add(url);
                  console.log(`    ✅ Found questions on: ${url} (alternative method)`);
                }
              } catch (checkError) {
                console.log('    ⚠️  Could not check for questions after navigation');
              }
            }
          } catch (retryError) {
            console.log(`    ❌ Alternative approach also failed: ${retryError.message}`);
          }
        }
      }

      currentIndex++;
    }

    console.log(`✅ Discovered ${this.questionUrls.size} question URLs from ${this.stats.pagesScanned} pages`);
  }

  /**
   * Enhanced question extraction with AI-like intelligence
   */
  async extractQuestionsEnhanced() {
    console.log('2. 📝 Extracting questions with AI intelligence...');

    // Test with a specific question first
    const testUrl = 'https://oneprep.xyz/question/1/';
    console.log(`🧪 Testing extraction with: ${testUrl}`);

    try {
      // Navigate to the test question page
      await this.page.goto(testUrl, {
        waitUntil: 'networkidle',
        timeout: ONEPREP_CONFIG.timeout,
      });

      // Wait for content to load
      await this.page.waitForTimeout(3000);

      // Check for authentication
      if (await this.checkForAuthentication()) {
        console.log('    ⚠️  Authentication required, please log in manually...');
        console.log('    ⏳ Waiting for manual authentication... (60 seconds)');
        console.log('    🔑 Please log in with:');
        console.log('       Username: dhilanm');
        console.log('       Password: ramilla1');
        await this.page.waitForTimeout(60000);

        // Check again after waiting
        if (await this.checkForAuthentication()) {
          console.log('    ⚠️  Still requires authentication, but continuing anyway...');
        } else {
          console.log('    ✅ Authentication successful!');
        }
      }

      // Debug: Let's see what's actually on the page
      console.log('    🔍 Debugging page content...');
      const pageContent = await this.page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          bodyText: document.body.textContent.substring(0, 1000),
          questionElements: document.querySelectorAll('.question, .question-content, .question-text, h1, h2, h3, p').length,
          allElements: document.querySelectorAll('*').length,
        };
      });

      console.log('    📄 Page info:', JSON.stringify(pageContent, null, 2));

      // Extract questions from this page with enhanced AI detection
      const pageQuestions = await this.extractQuestionsFromPageEnhanced(testUrl);

      if (pageQuestions.length > 0) {
        this.questions.push(...pageQuestions);
        this.stats.questionsFound += pageQuestions.length;
        console.log(`    ✅ Found ${pageQuestions.length} questions from test URL`);
        console.log('    📝 Sample question:', JSON.stringify(pageQuestions[0], null, 2));
      } else {
        console.log('    ❌ No questions found from test URL');

        // Let's try a more aggressive extraction
        console.log('    🔍 Trying aggressive extraction...');
        const aggressiveQuestions = await this.extractQuestionsAggressively(testUrl);
        if (aggressiveQuestions.length > 0) {
          this.questions.push(...aggressiveQuestions);
          this.stats.questionsFound += aggressiveQuestions.length;
          console.log(`    ✅ Found ${aggressiveQuestions.length} questions with aggressive extraction`);
          console.log('    📝 Sample question:', JSON.stringify(aggressiveQuestions[0], null, 2));
        }
      }
    } catch (error) {
      console.log(`    ❌ Failed to extract from test URL: ${error.message}`);
    }

    // Now continue with the rest of the URLs
    const questionUrlArray = Array.from(this.questionUrls);

    for (let i = 0; i < questionUrlArray.length && this.questions.length < ONEPREP_CONFIG.maxQuestions; i++) {
      const url = questionUrlArray[i];

      try {
        console.log(`  Extracting from: ${url} (${i + 1}/${questionUrlArray.length})`);

        // Navigate to the question page
        await this.page.goto(url, {
          waitUntil: 'networkidle',
          timeout: ONEPREP_CONFIG.timeout,
        });

        // Wait for content to load
        await this.page.waitForTimeout(3000);

        // Check for authentication
        if (await this.checkForAuthentication()) {
          console.log('    ⚠️  Authentication required, skipping...');
          continue;
        }

        // Extract questions from this page with enhanced AI detection
        const pageQuestions = await this.extractQuestionsFromPageEnhanced(url);

        if (pageQuestions.length > 0) {
          this.questions.push(...pageQuestions);
          this.stats.questionsFound += pageQuestions.length;
          console.log(`    ✅ Found ${pageQuestions.length} questions`);
        }

        // Rate limiting
        await this.page.waitForTimeout(ONEPREP_CONFIG.delay);
        this.reportProgress();
      } catch (error) {
        console.log(`    ❌ Failed to extract from ${url}: ${error.message}`);
        this.failedUrls.add(url);
        this.stats.errors++;
      }
    }

    console.log(`✅ Extracted ${this.questions.length} questions from ${questionUrlArray.length} URLs`);
  }

  /**
   * Aggressive question extraction that tries multiple strategies
   */
  async extractQuestionsAggressively(url) {
    const questions = await this.page.evaluate((pageUrl) => {
      const extractedQuestions = [];

      // Function to clean text
      const cleanText = (text) => {
        return text ? text.trim().replace(/\s+/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '') : '';
      };

      // Strategy 1: Look for any text that contains question marks
      const allText = document.body.textContent;
      const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 10);

      for (const line of lines) {
        if (line.includes('?') && line.length > 20 && line.length < 1000) {
          // Skip navigation and UI text
          if (line.includes('Menu') || line.includes('Navigation')
            || line.includes('Login') || line.includes('Sign up')
            || line.includes('Home') || line.includes('Practice Tests')) {
            continue;
          }

          // Check if it looks like a question
          if (line.includes('What') || line.includes('Which') || line.includes('How')
            || line.includes('Solve') || line.includes('Find') || line.includes('Calculate')
            || line.includes('Line') || line.includes('slope') || line.includes('perpendicular')) {
            extractedQuestions.push({
              id: `ai-aggressive-${Date.now()}-${extractedQuestions.length}`,
              question: line,
              options: [],
              correct_answer: '',
              explanation: '',
              difficulty: 'M',
              module: 'math',
              source: 'ai-aggressive',
              url: pageUrl,
            });
          }
        }
      }

      // Strategy 2: Look for specific OnePrep patterns
      const questionPatterns = [
        /Question ID #\d+/g,
        /Line [a-z] is defined by/g,
        /What is the slope of/g,
        /perpendicular to line/g,
      ];

      for (const pattern of questionPatterns) {
        const matches = allText.match(pattern);
        if (matches) {
          console.log(`Found pattern match: ${matches[0]}`);
        }
      }

      return extractedQuestions;
    }, url);

    return questions;
  }

  /**
   * Extract ALL URLs from the current page
   */
  async extractAllUrlsFromPage() {
    const urls = await this.page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      const urls = new Set();

      links.forEach((link) => {
        const href = link.href;
        if (href && href.startsWith('http') && href.includes('oneprep.xyz')) {
          urls.add(href);
        }
      });

      return Array.from(urls);
    });

    return urls;
  }

  /**
   * Check if a URL is likely to contain questions
   */
  isLikelyQuestionUrl(url) {
    const urlLower = url.toLowerCase();
    const questionKeywords = [
      'question',
      'practice',
      'quiz',
      'test',
      'exam',
      'sat',
      'math',
      'reading',
      'writing',
      'english',
    ];

    return questionKeywords.some(keyword => urlLower.includes(keyword));
  }

  /**
   * Check if authentication is required
   */
  async checkForAuthentication() {
    return await this.page.evaluate(() => {
      const authIndicators = [
        'sign in',
        'login',
        'register',
        'authentication',
        'please log in',
        'sign up',
      ];

      const bodyText = document.body.textContent.toLowerCase();
      return authIndicators.some(indicator => bodyText.includes(indicator));
    });
  }

  /**
   * Enhanced URL extraction with intelligent filtering
   */
  async extractUrlsFromPageEnhanced() {
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
          || href.includes('math')
          || href.includes('reading')
          || href.includes('writing')
          || href.includes('english')
        )) {
          // Filter out non-question URLs
          if (!href.includes('login') && !href.includes('sign') && !href.includes('auth')) {
            urls.add(href);
          }
        }
      });

      return Array.from(urls);
    });

    return urls;
  }

  /**
   * Enhanced question detection with AI-like intelligence
   */
  async pageHasQuestionsEnhanced() {
    return await this.page.evaluate(() => {
      // Check for question selectors
      const questionSelectors = [
        '.question',
        '[data-question]',
        '.question-content',
        '.question-text',
        '.problem',
        '.quiz-question',
        '.practice-question',
        '.sat-question',
        '.multiple-choice',
        '.answer-choice',
      ];

      for (const selector of questionSelectors) {
        if (document.querySelector(selector)) {
          return true;
        }
      }

      // Check for question-related text patterns
      const bodyText = document.body.textContent.toLowerCase();
      const questionKeywords = [
        'question',
        'problem',
        'solve',
        'answer',
        'choose',
        'select',
        'what is',
        'which of',
        'how many',
        'find the',
        'calculate',
        'multiple choice',
        'correct answer',
        'explanation',
      ];

      const questionPatterns = [
        /\d+\.\s*[A-Z]/g, // Numbered questions like "1. A"
        /[A-D]\)\s/g, // Multiple choice options like "A) "
        /\?/g, // Questions with question marks
      ];

      // Check for question keywords
      const hasKeywords = questionKeywords.some(keyword => bodyText.includes(keyword));

      // Check for question patterns
      const hasPatterns = questionPatterns.some(pattern => pattern.test(bodyText));

      return hasKeywords || hasPatterns;
    });
  }

  /**
   * Enhanced question extraction with AI-like intelligence
   */
  async extractQuestionsFromPageEnhanced(url) {
    const questions = await this.page.evaluate((pageUrl) => {
      const extractedQuestions = [];

      // Function to clean text
      const cleanText = (text) => {
        if (!text) {
          return '';
        }

        // Remove extra whitespace and newlines
        let cleaned = text.trim().replace(/\s+/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');

        // Remove common UI elements
        cleaned = cleaned.replace(/Mark for Review \d{2}:\d{2}/g, '');
        cleaned = cleaned.replace(/Solved \d+ (minutes?|hours?|days?|months?) ago in \d+ minutes? \d+ seconds? \(\d+ Attempts?\)/g, '');
        cleaned = cleaned.replace(/Solved about \d+ (minutes?|hours?|days?|months?) ago in \d+ minutes? \d+ seconds?/g, '');
        cleaned = cleaned.replace(/Explanation/g, '');

        // Clean up MathML tags (simplify them)
        cleaned = cleaned.replace(/<math[^>]*>/g, '');
        cleaned = cleaned.replace(/<\/math>/g, '');
        cleaned = cleaned.replace(/<mi>([^<]*)<\/mi>/g, '$1');
        cleaned = cleaned.replace(/<mo>([^<]*)<\/mo>/g, '$1');
        cleaned = cleaned.replace(/<mn>([^<]*)<\/mn>/g, '$1');
        cleaned = cleaned.replace(/<mfrac><mrow><mn>([^<]*)<\/mn><\/mrow><mrow><mn>([^<]*)<\/mn><\/mrow><\/mfrac>/g, '$1/$2');
        cleaned = cleaned.replace(/<mrow><mn>([^<]*)<\/mn><\/mrow>/g, '$1');

        // Remove any remaining HTML tags
        cleaned = cleaned.replace(/<[^>]*>/g, '');

        // Clean up extra spaces
        cleaned = cleaned.replace(/\s+/g, ' ').trim();

        return cleaned;
      };

      // OnePrep-specific question selectors based on the actual structure
      const questionSelectors = [
        // OnePrep specific selectors from the actual page structure
        '.question-content',
        '.question-text',
        '.question-body',
        '.problem-content',
        '.question',
        '[data-question]',
        // Generic selectors
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'div[class*="question"]',
        'div[class*="problem"]',
        'div[class*="content"]',
      ];

      // Extract questions from selectors
      for (const selector of questionSelectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} elements with selector: ${selector}`);

        elements.forEach((element, index) => {
          const questionText = cleanText(element.textContent);

          if (questionText && questionText.length > 10 && questionText.length < 5000) {
            // Skip if it's just navigation or UI text
            if (questionText.includes('Menu') || questionText.includes('Navigation')
              || questionText.includes('Login') || questionText.includes('Sign up')
              || questionText.length < 20) {
              return;
            }

            // Extract options with enhanced detection
            const options = [];
            const optionSelectors = [
              // OnePrep specific
              '.option',
              '.choice',
              '.answer',
              '.answer-choice',
              '.multiple-choice-option',
              '[data-option]',
              // Generic
              'input[type="radio"]',
              'input[type="checkbox"]',
              'label',
              'li',
            ];

            // Look for options in the current element and its children
            optionSelectors.forEach((optSelector) => {
              const optionElements = element.querySelectorAll(optSelector);
              optionElements.forEach((opt) => {
                const optionText = cleanText(opt.textContent || opt.value);
                if (optionText && optionText.length > 0 && optionText.length < 500) {
                  // Check if it looks like an option (A, B, C, D or numbered)
                  if (optionText.match(/^[A-D]\)/) || optionText.match(/^[1-4]\./)
                    || optionText.match(/^[A-D]\./) || optionText.length > 5) {
                    options.push(optionText);
                  }
                }
              });
            });

            // If no options found in selectors, try to find them in the page
            if (options.length === 0) {
              const allElements = document.querySelectorAll('*');
              for (const el of allElements) {
                const text = cleanText(el.textContent);
                if (text && (text.match(/^[A-D]\)/) || text.match(/^[1-4]\./)) && text.length > 5 && text.length < 500) {
                  options.push(text);
                }
              }
            }

            // Extract correct answer
            let correctAnswer = '';
            const correctAnswerSelectors = [
              '.correct-answer',
              '.answer',
              '[data-correct]',
              '.solution',
              '.correct',
              '.right-answer',
            ];

            for (const selector of correctAnswerSelectors) {
              const correctElement = element.querySelector(selector) || document.querySelector(selector);
              if (correctElement) {
                correctAnswer = cleanText(correctElement.textContent);
                break;
              }
            }

            // Extract explanation
            let explanation = '';
            const explanationSelectors = [
              '.explanation',
              '.solution',
              '.rationale',
              '.hint',
              '.explanation-text',
              '.solution-text',
            ];

            for (const selector of explanationSelectors) {
              const explanationElement = element.querySelector(selector) || document.querySelector(selector);
              if (explanationElement) {
                explanation = cleanText(explanationElement.textContent);
                break;
              }
            }

            // Only add if we have a meaningful question
            if (questionText.length > 20) {
              extractedQuestions.push({
                id: `ai-enhanced-${Date.now()}-${index}`,
                question: questionText,
                options: options.slice(0, 4), // Limit to 4 options
                correct_answer: correctAnswer,
                explanation,
                difficulty: 'M',
                module: determineModuleFromUrl(pageUrl),
                source: 'ai-enhanced',
                url: pageUrl,
              });
            }
          }
        });
      }

      // If no questions found in selectors, try AI-like content extraction
      if (extractedQuestions.length === 0) {
        console.log('No questions found with selectors, trying content extraction...');

        // Look for specific OnePrep question patterns
        const bodyText = document.body.textContent;
        const lines = bodyText.split('\n').map(line => line.trim()).filter(line => line.length > 10);

        // Look for question-like content with enhanced patterns
        for (const line of lines) {
          if (
            line.includes('?')
            && (line.includes('What') || line.includes('Which') || line.includes('How')
              || line.includes('Solve') || line.includes('Find') || line.includes('Calculate')
              || line.match(/\d+\.\s/) || line.match(/[A-D]\)\s/))
            && line.length > 20 && line.length < 1000
          ) {
            const cleanedLine = cleanText(line);
            if (cleanedLine.length > 20) {
              extractedQuestions.push({
                id: `ai-enhanced-${Date.now()}-${extractedQuestions.length}`,
                question: cleanedLine,
                options: [],
                correct_answer: '',
                explanation: '',
                difficulty: 'M',
                module: determineModuleFromUrl(pageUrl),
                source: 'ai-enhanced',
                url: pageUrl,
              });
            }
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

      console.log(`Extracted ${extractedQuestions.length} questions from page`);
      return extractedQuestions;
    }, url);

    return questions;
  }

  /**
   * Report progress periodically
   */
  reportProgress() {
    const now = Date.now();
    if (now - this.stats.lastProgressTime > 30000) { // Every 30 seconds
      const duration = now - this.stats.startTime;
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);

      console.log(`📊 Progress: ${this.stats.pagesScanned} pages scanned, ${this.questions.length} questions found (${minutes}m ${seconds}s)`);
      this.stats.lastProgressTime = now;
    }
  }

  /**
   * Save results and import to Supabase
   */
  async saveResults() {
    console.log('3. 💾 Saving results...');

    // Transform to Prepify format
    const prepifyQuestions = this.transformToPrepifyFormat(this.questions);

    // Save to local file
    const outputPath = path.join(__dirname, 'data', 'ai-enhanced-oneprep-questions.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(prepifyQuestions, null, 2));
    console.log(`💾 Saved ${prepifyQuestions.length} questions to: ${outputPath}`);

    // Save statistics
    const statsPath = path.join(__dirname, 'data', 'ai-enhanced-scraping-stats.json');
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
          question_id: question.id || `ai-enhanced-${index}`,
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
  const scraper = new EnhancedAIOnePrepScraper();

  try {
    await scraper.scrape();
    scraper.printStats();
  } catch (error) {
    console.error('❌ Enhanced AI scraping failed:', error);
    process.exit(1);
  }
}

// Run the enhanced AI scraper
main();
