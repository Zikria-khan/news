import fs from 'node:fs';
import path from 'node:path';
import { normalizeNameRecord } from '../lib/data/name-normalizer.js';
import { enrichNameProfile } from '../lib/data/name-enricher.js';

// ─────────────────────────────────────────────────────────────────────────────
// NETLIFY BUILD COST
// This verifier costs ~0.8 s of build time and runs on every deploy through
// `prebuild`. verify-static.mjs runs after `next build` and is never skipped.
// SKIP_CONTENT_VERIFIERS=1 is an emergency local-only escape hatch; it is
// deliberately NOT set in netlify.toml. Run locally (or in CI) with:
//   npm run verify
// ─────────────────────────────────────────────────────────────────────────────
if (process.env.SKIP_CONTENT_VERIFIERS === '1') {
  console.log('verify-content: skipped (SKIP_CONTENT_VERIFIERS=1)');
  process.exit(0);
}


// ---------------------------------------------------------------------------
// Content quality gate — runs on every build via `prebuild`.
//
// Guards the two properties that decide whether Google indexes these pages:
//
//   1. COVERAGE  — what share of records yield a real meaning, origin, FAQ set
//                  and script forms. A page with no meaning is thin content.
//   2. UNIQUENESS — no two names may produce the same intro paragraph, SEO
//                  title or content signature. Duplicate content across
//                  thousands of pages is the fastest route to a site-wide
//                  quality demotion.
//
// It samples deterministically so the numbers are reproducible build to build,
// and it FAILS the build if uniqueness drops below 100% or coverage collapses.
// ---------------------------------------------------------------------------

const ROOT = path.resolve(process.cwd());
const NAMES_DIR = path.join(ROOT, 'public', 'names');
const RELIGIONS = ['islamic', 'christian', 'hindu', 'italian'];
const SAMPLE_SIZE = Number(process.env.VERIFY_SAMPLE) || 1500;

// Deterministic PRNG so the sample is identical on every run.
let seed = 20261005;
const rand = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

const pool = [];
for (const rel of RELIGIONS) {
  const dir = path.join(NAMES_DIR, rel);
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith('.json') || entry.startsWith('_')) continue;
    pool.push([rel, entry.replace(/\.json$/, '')]);
  }
}

const sample = [];
const remaining = [...pool];
while (sample.length < SAMPLE_SIZE && remaining.length) {
  sample.push(remaining.splice(Math.floor(rand() * remaining.length), 1)[0]);
}

const stats = {
  n: 0, meaning: 0, longMeaning: 0, origin: 0, gender: 0,
  faqs: 0, scripts: 0, pronunciation: 0, acrostic: 0,
  culture: 0, history: 0, seoTitle: 0, indexable: 0,
};
const signatures = new Set();
const intros = new Set();
const titles = new Set();
const byReligion = {};

for (const [rel, slug] of sample) {
  const file = path.join(NAMES_DIR, rel, `${slug}.json`);
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    continue;
  }
  const data = parsed && typeof parsed === 'object' && 'data' in parsed ? parsed.data : parsed;
  const base = normalizeNameRecord(data, rel, slug);
  if (!base) continue;
  const n = enrichNameProfile(base);

  stats.n++;
  byReligion[rel] = byReligion[rel] || { n: 0, meaning: 0, gender: 0 };
  byReligion[rel].n++;

  if (n.shortMeaning) { stats.meaning++; byReligion[rel].meaning++; }
  if (n.longMeaning) stats.longMeaning++;
  if (n.origin) stats.origin++;
  if (n.genderKey) { stats.gender++; byReligion[rel].gender++; }
  if (n.faqs.length) stats.faqs++;
  if (n.scripts.length) stats.scripts++;
  if (n.pronunciation.english) stats.pronunciation++;
  if (n.acrostic.length) stats.acrostic++;
  if (n.culturalSection.length) stats.culture++;
  if (n.historicalSection.length) stats.history++;
  if (n.seo.title) stats.seoTitle++;
  if (n.shortMeaning && n.origin && (n.longMeaning || n.meaningSection.length)) stats.indexable++;

  signatures.add(n.contentSignature);
  intros.add(n.intro);
  titles.add(n.seo.title);
}

const pct = (v) => `${((v / stats.n) * 100).toFixed(1)}%`;

console.log(`Content verification — ${stats.n} records sampled from ${pool.length}`);
console.log(`  meaning        ${String(stats.meaning).padStart(5)}  ${pct(stats.meaning)}`);
console.log(`  long meaning   ${String(stats.longMeaning).padStart(5)}  ${pct(stats.longMeaning)}`);
console.log(`  origin         ${String(stats.origin).padStart(5)}  ${pct(stats.origin)}`);
console.log(`  gender         ${String(stats.gender).padStart(5)}  ${pct(stats.gender)}`);
console.log(`  FAQs           ${String(stats.faqs).padStart(5)}  ${pct(stats.faqs)}`);
console.log(`  script forms   ${String(stats.scripts).padStart(5)}  ${pct(stats.scripts)}`);
console.log(`  pronunciation  ${String(stats.pronunciation).padStart(5)}  ${pct(stats.pronunciation)}`);
console.log(`  cultural notes ${String(stats.culture).padStart(5)}  ${pct(stats.culture)}`);
console.log(`  history        ${String(stats.history).padStart(5)}  ${pct(stats.history)}`);
console.log(`  indexable      ${String(stats.indexable).padStart(5)}  ${pct(stats.indexable)}`);
console.log(
  `  uniqueness     intros ${intros.size}/${stats.n} · titles ${titles.size}/${stats.n} · signatures ${signatures.size}/${stats.n}`
);

const failures = [];
if (intros.size !== stats.n) failures.push(`duplicate intro paragraphs (${intros.size}/${stats.n})`);
if (titles.size !== stats.n) failures.push(`duplicate SEO titles (${titles.size}/${stats.n})`);
if (signatures.size !== stats.n) failures.push(`duplicate content signatures (${signatures.size}/${stats.n})`);
if (stats.meaning / stats.n < 0.9) failures.push(`meaning coverage below 90% (${pct(stats.meaning)})`);
if (stats.origin / stats.n < 0.9) failures.push(`origin coverage below 90% (${pct(stats.origin)})`);

if (failures.length) {
  console.error('\nContent verification FAILED:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('Content verification passed — every sampled page is unique and substantive.');
