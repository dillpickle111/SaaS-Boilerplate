#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('node:fs');
const path = require('node:path');

// Load environment variables first
require('dotenv').config({ path: '.env.local' });

console.log('🤖 AI-Powered OnePrep Scraper Launcher');
console.log('=====================================\n');

// Check if Playwright is installed
function checkPlaywright() {
  try {
    require('playwright');
    return true;
  } catch (error) {
    return false;
  }
}

// Check if required packages are installed
function checkDependencies() {
  const requiredPackages = ['playwright', '@supabase/supabase-js'];
  const missingPackages = [];
  
  for (const pkg of requiredPackages) {
    try {
      require(pkg);
    } catch (error) {
      missingPackages.push(pkg);
    }
  }
  
  return missingPackages;
}

// Install missing packages
async function installPackages(packages) {
  console.log(`📦 Installing missing packages: ${packages.join(', ')}`);
  
  return new Promise((resolve, reject) => {
    const install = spawn('npm', ['install', ...packages], { stdio: 'inherit' });
    
    install.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Packages installed successfully!');
        resolve();
      } else {
        reject(new Error(`Failed to install packages (exit code: ${code})`));
      }
    });
  });
}

// Run the AI scraper
async function runScraper(type = 'enhanced') {
  const scriptPath = type === 'enhanced' 
    ? path.join(__dirname, 'ai-oneprep-scraper-enhanced.js')
    : path.join(__dirname, 'ai-oneprep-scraper.js');
  
  if (!fs.existsSync(scriptPath)) {
    console.error(`❌ Scraper script not found: ${scriptPath}`);
    return;
  }
  
  console.log(`🚀 Starting ${type} AI scraper...`);
  console.log('⚠️  This will open a browser window. Close it to stop the scraper.\n');
  
  return new Promise((resolve, reject) => {
    const scraper = spawn('node', [scriptPath], { stdio: 'inherit' });
    
    scraper.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ AI scraper completed successfully!');
        resolve();
      } else {
        console.log(`\n❌ AI scraper failed (exit code: ${code})`);
        reject(new Error(`Scraper failed with exit code: ${code}`));
      }
    });
    
    scraper.on('error', (error) => {
      console.error('❌ Failed to start scraper:', error.message);
      reject(error);
    });
  });
}

// Show usage information
function showUsage() {
  console.log('Usage:');
  console.log('  node scripts/run-ai-scraper.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --enhanced    Run enhanced AI scraper (default)');
  console.log('  --basic       Run basic AI scraper');
  console.log('  --install     Install missing dependencies');
  console.log('  --help        Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/run-ai-scraper.js --enhanced');
  console.log('  node scripts/run-ai-scraper.js --basic');
  console.log('  node scripts/run-ai-scraper.js --install');
  console.log('');
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  // Check for help
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }
  
  // Check for install
  if (args.includes('--install')) {
    const missingPackages = checkDependencies();
    if (missingPackages.length > 0) {
      try {
        await installPackages(missingPackages);
      } catch (error) {
        console.error('❌ Failed to install packages:', error.message);
        process.exit(1);
      }
    } else {
      console.log('✅ All required packages are already installed!');
    }
    return;
  }
  
  // Check dependencies
  const missingPackages = checkDependencies();
  if (missingPackages.length > 0) {
    console.log('❌ Missing required packages:', missingPackages.join(', '));
    console.log('Run: node scripts/run-ai-scraper.js --install');
    process.exit(1);
  }
  
  // Determine scraper type
  let scraperType = 'enhanced';
  if (args.includes('--basic')) {
    scraperType = 'basic';
  }
  
  // Check environment variables
  const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const missingEnvVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  }
  
  if (missingEnvVars.length > 0) {
    console.error('❌ Missing environment variables:', missingEnvVars.join(', '));
    console.log('Please add them to your .env.local file');
    process.exit(1);
  }
  
  // Run the scraper
  try {
    await runScraper(scraperType);
  } catch (error) {
    console.error('❌ Scraper failed:', error.message);
    process.exit(1);
  }
}

// Run the launcher
main().catch(error => {
  console.error('❌ Launcher failed:', error.message);
  process.exit(1);
}); 