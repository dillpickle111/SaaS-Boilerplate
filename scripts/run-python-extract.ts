/* eslint-disable no-console */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const mathPath = path.resolve('SAT Suite Question Bank - 50M.pdf');
  const rwPath = path.resolve('SAT Suite Question Bank - 50RW.pdf');
  const outPath = path.resolve('scripts/data/import-ready-questions.json');
  const imgDir = path.resolve('public/qmedia');

  if (!fs.existsSync(mathPath) || !fs.existsSync(rwPath)) {
    console.error('❌ Missing input PDFs next to project root:');
    console.error('  - SAT Suite Question Bank - 50M.pdf');
    console.error('  - SAT Suite Question Bank - 50RW.pdf');
    process.exit(1);
  }

  await new Promise<void>((resolve, reject) => {
    console.log('🚀 Running python extractor...');
    const py = spawn('python3', [
      path.resolve(__dirname, 'pdf_extract_cb.py'),
      '--math', mathPath,
      '--rw', rwPath,
      '--out', outPath,
      '--imgdir', imgDir,
    ], { stdio: 'inherit' });

    py.on('exit', (code) => {
      if (code === 0) {
        console.log('✅ Python extraction complete');
        resolve();
      } else {
        reject(new Error(`Python exited with code ${code}`));
      }
    });
  });

  // Import to Supabase using existing importer
  await new Promise<void>((resolve, reject) => {
    console.log('📥 Importing extracted questions into Supabase...');
    const node = spawn('node', [path.resolve(__dirname, 'import-pdf-only.js')], { stdio: 'inherit' });
    node.on('exit', (code) => {
      if (code === 0) {
        console.log('✅ Import complete');
        resolve();
      } else {
        reject(new Error(`Import script exited with code ${code}`));
      }
    });
  });
}

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});

 