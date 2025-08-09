/* eslint-disable no-console */
import fs from 'node:fs';

type Choice = { label: string; text: string };
type Item = {
  id: string;
  assessment: string;
  test: string;
  domain: string;
  skill: string;
  difficulty: string;
  number: number | null;
  stem: string;
  choices?: Choice[] | null;
  answer?: string | null;
};

const path = 'scripts/data/import-ready-questions.json';
const raw = fs.readFileSync(path, 'utf8');
const data: Item[] = JSON.parse(raw);

const total = data.length;
const byTest = data.reduce<Record<string, number>>((acc, it) => {
  acc[it.test] = (acc[it.test] ?? 0) + 1;
  return acc;
}, {});
const mcq4 = data.filter(it => Array.isArray(it.choices) && it.choices?.length === 4).length;

console.log('Total:', total);
console.log('By test:', byTest);
console.log('MCQ choices==4:', mcq4);

function summarize(it: Item) {
  const stem = (it.stem || '').slice(0, 140).replace(/\s+/g, ' ');
  const labels = Array.isArray(it.choices) ? it.choices.map(c => c.label).join('') : '';
  console.log({
    id: it.id,
    test: it.test,
    stem,
    labels,
    answer: it.answer ?? null,
    domain: it.domain,
    skill: it.skill,
    difficulty: it.difficulty,
  });
}

const math = data.filter(d => d.test === 'Math').slice(0, 2);
const rw = data.filter(d => d.test === 'Reading and Writing').slice(0, 2);

console.log('\nSample Math (2):');
math.forEach(summarize);
console.log('\nSample R&W (2):');
rw.forEach(summarize);



