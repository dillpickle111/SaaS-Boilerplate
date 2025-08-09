import fs from 'node:fs';
import path from 'node:path';

// This is a minimal smoke test that validates the output structure after extraction
// Note: The test assumes scripts/data/import-ready-questions.json is present

describe('pdf_extract_cb output schema', () => {
  const outPath = path.resolve('scripts/data/import-ready-questions.json');

  it('has valid shape for at least one item', () => {
    if (!fs.existsSync(outPath)) {
      console.warn('Skipping test: output JSON not found');
      return;
    }
    const data = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    const q = data[0];
    expect(q).toHaveProperty('id');
    expect(q).toHaveProperty('assessment');
    expect(q).toHaveProperty('test');
    expect(q).toHaveProperty('difficulty');
    expect(q).toHaveProperty('stem');
    expect(q).toHaveProperty('pages');
    if (q.choices) {
      expect(q.choices.length).toBeGreaterThanOrEqual(1);
      expect(q.choices[0]).toHaveProperty('label');
      expect(q.choices[0]).toHaveProperty('text');
    }
  });
});

 