# 🤖 AI-Powered OnePrep Scraper Guide

This guide will help you use the AI-powered Playwright scraper to automatically extract all SAT questions from OnePrep's site.

## 🚀 Quick Start

### Option 1: Run Enhanced AI Scraper (Recommended)

```bash
# Run the enhanced AI scraper (most intelligent)
node scripts/run-ai-scraper.js --enhanced
```

### Option 2: Run Basic AI Scraper

```bash
# Run the basic AI scraper (faster, less comprehensive)
node scripts/run-ai-scraper.js --basic
```

### Option 3: Install Dependencies First

```bash
# Install missing dependencies
node scripts/run-ai-scraper.js --install
```

## 🎯 What the AI Scraper Does

### 🤖 **AI Intelligence Features:**

1. **Intelligent URL Discovery**: Automatically finds all question-related URLs on OnePrep
2. **Smart Question Detection**: Uses AI-like patterns to identify questions
3. **Authentication Handling**: Detects and skips authentication-required pages
4. **Content Extraction**: Intelligently extracts questions, options, and explanations
5. **Progress Tracking**: Real-time progress reporting and statistics
6. **Error Recovery**: Handles failures gracefully and continues scraping

### 🔍 **Scraping Strategy:**

1. **URL Discovery Phase**:
   - Starts from OnePrep's question bank page
   - Follows all question-related links
   - Discovers up to 2,000 pages (configurable)
   - Filters out non-question URLs

2. **Question Extraction Phase**:
   - Visits each discovered question URL
   - Uses AI-like patterns to detect questions
   - Extracts questions, options, answers, and explanations
   - Handles multiple question formats

3. **Data Processing Phase**:
   - Transforms questions to Prepify format
   - Removes duplicates
   - Saves to local files
   - Imports to Supabase

## 📊 Configuration Options

### Enhanced Scraper Settings (`ai-oneprep-scraper-enhanced.js`)

```javascript
const ONEPREP_CONFIG = {
  baseUrl: 'https://oneprep.xyz',
  startUrl: 'https://oneprep.xyz/question-set/sat-suite-question-bank/',
  maxPages: 2000,           // Maximum pages to scan
  maxQuestions: 10000,      // Maximum questions to extract
  delay: 1500,              // Delay between requests (ms)
  timeout: 45000,           // Page timeout (ms)
  headless: false,          // Set to true for production
  slowMo: 200,              // Slower for better reliability
};
```

### Basic Scraper Settings (`ai-oneprep-scraper.js`)

```javascript
const ONEPREP_CONFIG = {
  baseUrl: 'https://oneprep.xyz',
  startUrl: 'https://oneprep.xyz/question-set/sat-suite-question-bank/',
  maxPages: 1000,           // Maximum pages to scan
  maxQuestions: 5000,       // Maximum questions to extract
  delay: 1000,              // Delay between requests (ms)
  timeout: 30000,           // Page timeout (ms)
  headless: false,          // Set to true for production
  slowMo: 100,              // Slower for better reliability
};
```

## 🔧 Advanced Usage

### Custom Configuration

You can modify the scraper configuration by editing the `ONEPREP_CONFIG` object in the script files:

```javascript
// Example: Increase scanning limits
const ONEPREP_CONFIG = {
  maxPages: 5000,           // Scan more pages
  maxQuestions: 20000,      // Extract more questions
  delay: 2000,              // Slower for better reliability
  headless: true,           // Run in background
};
```

### Running in Production

For production use, set `headless: true` in the configuration:

```javascript
const ONEPREP_CONFIG = {
  // ... other settings
  headless: true,           // Run without browser window
  slowMo: 0,                // No artificial delays
};
```

## 📁 Output Files

### Generated Files

The scraper generates several output files in the `scripts/data/` directory:

1. **`ai-enhanced-oneprep-questions.json`**: Extracted questions in Prepify format
2. **`ai-enhanced-scraping-stats.json`**: Scraping statistics and metrics
3. **`ai-oneprep-questions.json`**: Basic scraper output (if used)

### Statistics File Format

```json
{
  "pagesScanned": 150,
  "questionsFound": 2500,
  "errors": 5,
  "startTime": 1703123456789,
  "endTime": 1703124567890,
  "duration": 1111101,
  "totalQuestions": 2500,
  "uniqueQuestions": 2400,
  "visitedUrls": 150,
  "questionUrls": 120,
  "failedUrls": 5
}
```

## 🚨 Troubleshooting

### Common Issues

#### ❌ "Playwright not installed"
```bash
# Install Playwright
node scripts/run-ai-scraper.js --install
```

#### ❌ "Missing environment variables"
Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### ❌ "Browser won't start"
```bash
# Reinstall Playwright browsers
npx playwright install
```

#### ❌ "Scraping blocked"
- OnePrep might be blocking automated requests
- Try increasing delays in configuration
- Use VPN or different IP
- Run in headless mode

#### ❌ "Authentication required"
- The scraper automatically detects and skips authentication pages
- This is normal behavior for OnePrep's site
- The scraper will continue with accessible content

### Performance Tips

1. **Increase Delays**: Set `delay: 2000` for better reliability
2. **Use Headless Mode**: Set `headless: true` for production
3. **Limit Scanning**: Reduce `maxPages` for faster runs
4. **Monitor Progress**: Check console output for progress updates

## 📈 Monitoring and Progress

### Real-time Progress

The scraper provides real-time progress updates:

```
📊 Progress: 150 pages scanned, 2500 questions found (5m 30s)
```

### Final Statistics

At the end of scraping, you'll see comprehensive statistics:

```
📊 Final Statistics:
⏱️  Duration: 15m 30s
📄 Pages Scanned: 150
🔗 URLs Visited: 150
❓ Question URLs Found: 120
📝 Questions Extracted: 2500
❌ Errors: 5
💾 Failed URLs: 5
```

## 🔄 Automation and Scheduling

### Automated Scraping

You can automate the scraper using cron jobs or CI/CD:

```bash
# Example: Run daily at 2 AM
0 2 * * * cd /path/to/prepify && node scripts/run-ai-scraper.js --enhanced
```

### Continuous Monitoring

Set up monitoring to track scraping success:

```bash
# Check if scraper completed successfully
if [ -f "scripts/data/ai-enhanced-scraping-stats.json" ]; then
  echo "Scraper completed successfully"
else
  echo "Scraper failed or not run"
fi
```

## 🎯 Success Metrics

### Expected Results

After successful scraping, you should see:

- ✅ **2,000+ questions** extracted from OnePrep
- ✅ **Questions categorized** by module (math, reading, writing)
- ✅ **Questions accessible** in your Prepify app
- ✅ **Full question content** with options and explanations
- ✅ **Data saved** to local files and Supabase

### Quality Indicators

- **High question count**: 2,000+ questions indicates successful scraping
- **Low error rate**: <5% errors indicates good reliability
- **Good coverage**: Questions from multiple modules
- **Complete data**: Questions with options and explanations

## 🚀 Next Steps

1. **Test the scraper**: Run with `--enhanced` flag
2. **Monitor results**: Check generated files and statistics
3. **Verify import**: Check Supabase for imported questions
4. **Test the app**: Visit `/questions` to see imported questions
5. **Schedule automation**: Set up regular scraping

## 📞 Support

If you encounter issues:

1. **Check logs**: Look at console output for error messages
2. **Verify configuration**: Ensure environment variables are set
3. **Test dependencies**: Run `--install` to check packages
4. **Check permissions**: Ensure write access to `scripts/data/`
5. **Review statistics**: Check generated stats files for insights

---

**🎯 You're ready to use the AI-powered OnePrep scraper!** This intelligent automation will scan through OnePrep's entire site and extract all available SAT questions for your Prepify database. 