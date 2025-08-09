const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up OnePrep scraper...');

// Check if required packages are installed
function checkPackage(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch (error) {
    return false;
  }
}

// Install missing packages
function installPackages() {
  const requiredPackages = ['axios', 'cheerio'];
  const missingPackages = [];
  
  console.log('📦 Checking required packages...');
  
  for (const pkg of requiredPackages) {
    if (!checkPackage(pkg)) {
      missingPackages.push(pkg);
      console.log(`  ❌ Missing: ${pkg}`);
    } else {
      console.log(`  ✅ Found: ${pkg}`);
    }
  }
  
  if (missingPackages.length > 0) {
    console.log(`\n📥 Installing missing packages: ${missingPackages.join(', ')}`);
    try {
      execSync(`npm install ${missingPackages.join(' ')}`, { stdio: 'inherit' });
      console.log('✅ Packages installed successfully!');
    } catch (error) {
      console.error('❌ Failed to install packages:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ All required packages are already installed!');
  }
}

// Check environment variables
function checkEnvironment() {
  console.log('\n🔧 Checking environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
      console.log(`  ❌ Missing: ${varName}`);
    } else {
      console.log(`  ✅ Found: ${varName}`);
    }
  }
  
  if (missingVars.length > 0) {
    console.log('\n❌ Missing environment variables!');
    console.log('Please add the following to your .env.local file:');
    missingVars.forEach(varName => {
      console.log(`${varName}=your_value_here`);
    });
    process.exit(1);
  }
  
  console.log('✅ Environment variables are configured!');
}

// Create data directory
function createDataDirectory() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    console.log('\n📁 Creating data directory...');
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Data directory created!');
  } else {
    console.log('\n✅ Data directory already exists!');
  }
}

// Run the scraper
function runScraper() {
  console.log('\n🕷️  Starting OnePrep scraper...');
  
  try {
    // Try the advanced scraper first
    console.log('🔍 Running advanced scraper...');
    require('./advanced-oneprep-scraper.js');
  } catch (error) {
    console.log('⚠️  Advanced scraper failed, trying basic scraper...');
    try {
      require('./scrape-oneprep-questions.js');
    } catch (scraperError) {
      console.error('❌ Both scrapers failed:', scraperError.message);
      console.log('\n🔧 Manual steps you can try:');
      console.log('1. Visit https://oneprep.com in your browser');
      console.log('2. Check if the site requires authentication');
      console.log('3. Look for any API endpoints in the browser dev tools');
      console.log('4. Consider using browser automation tools like Puppeteer');
      process.exit(1);
    }
  }
}

// Main function
async function main() {
  try {
    console.log('🎯 OnePrep Scraper Setup\n');
    
    // Step 1: Install packages
    installPackages();
    
    // Step 2: Check environment
    checkEnvironment();
    
    // Step 3: Create data directory
    createDataDirectory();
    
    // Step 4: Run scraper
    runScraper();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
main(); 