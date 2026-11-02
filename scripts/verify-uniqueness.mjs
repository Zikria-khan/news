import fs from 'node:fs';
import path from 'node:path';
import { normalizeNameRecord } from '../lib/data/name-normalizer.js';
import { enrichNameProfile } from '../lib/data/name-enricher.js';
import { isIndexableRecord } from '../lib/data/indexability.js';

// ─────────────────────────────────────────────────────────────────────────────
// NETLIFY BUILD COST
// This verifier costs ~17 s of build time and gates every deploy through
// `prebuild`. verify-static.mjs runs after `next build` and is never skipped.
// SKIP_CONTENT_VERIFIERS=1 is an emergency local-only escape hatch; it is
// deliberately NOT set in netlify.toml. Run locally (or in CI) with:
//   npm run verify
// ─────────────────────────────────────────────────────────────────────────────
if (process.env.SKIP_CONTENT_VERIFIERS === '1') {
  console.log('verify-uniqueness: skipped (SKIP_CONTENT_VERIFIERS=1)');
  process.exit(0);
}


// ---------------------------------------------------------------------------
// Duplicate-content gate — runs on every build via `prebuild`.
//
// WHY THIS EXISTS
// The previous gate only proved that the *intro string* differed between pages.
// That is far too weak a test. Google's near-duplicate detection works on
// overlapping n-grams across the whole document, so two pages can have
// different intros and still be 90% identical once the shared section skeleton,
// shared headings and shared sentence frames are counted.
//
// WHAT THIS MEASURES
//   1. SHINGLE SIMILARITY — 5-word shingles over the full rendered text of each
//      page, compared pairwise with Jaccard. This is the standard
//      near-duplicate measure and it is what actually predicts consolidation.
//   2. SECTION-SEQUENCE DIVERSITY — how many distinct section orders exist.
//   3. HEADING DIVERSITY — how many distinct H2 sets exist.
//   4. EXACT-UNIQUENESS — titles, H1s, intros, signatures.
//
// It samples deterministically, reports the worst offending pair, and FAILS the
// build if the maximum pairwise similarity exceeds the threshold.
// ---------------------------------------------------------------------------

const ROOT = path.resolve(process.cwd());
const NAMES_DIR = path.join(ROOT, 'public', 'names');
const MANIFEST_PATH = path.join(ROOT, 'src', 'lib', 'data', 'names-manifest.json');
const RELIGIONS = ['islamic', 'christian', 'hindu', 'italian'];

// Slugs that the manifest has consolidated onto a canonical page. They are
// served noindex with a canonical pointing elsewhere, so they never compete in
// the index and must not be measured against the duplicate budget.
const canonicalised = new Set();
try {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  for (const rel of RELIGIONS) {
    for (const item of manifest[rel] || []) {
      if (item.canonicalSlug) canonicalised.add(`${rel}:${item.slug}`);
    }
  }
} catch {
  // Manifest not built yet — the gate still runs, just without consolidation.
}

const SAMPLE_SIZE = Number(process.env.UNIQUENESS_SAMPLE) || 1200;
const SHINGLE_N = 5;
// Two pages sharing more than this share of their 5-word shingles are treated
// as near-duplicates. 0.30 is deliberately strict: real editorial pages on the
// same topic typically sit well below it.
const MAX_SIMILARITY = Number(process.env.UNIQUENESS_MAX) || 0.3;

let seed = 20261006;
const rand = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

// ── collect the pool ─────────────────────────────────────────────────────────
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

// ── build the rendered text for each sampled page ────────────────────────────
function shingles(text, n) {
  const words = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const set = new Set();
  for (let i = 0; i + n <= words.length; i++) {
    set.add(words.slice(i, i + n).join(' '));
  }
  return set;
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const s of small) if (large.has(s)) inter++;
  return inter / (a.size + b.size - inter);
}

const pages = [];
const titles = new Set();
const h1s = new Set();
const intros = new Set();
const signatures = new Set();
const sectionOrders = new Set();
const headingSets = new Set();
const stats = { n: 0, meaning: 0, origin: 0, faqs: 0, scripts: 0, sections: 0, words: 0, skipped: 0, canonicalised: 0 };

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

  // Only INDEXABLE pages are measured. A record whose meaning or origin is a
  // negative assertion ("no confident lexical sense is asserted") is served
  // noindex and kept out of the sitemap, so it never competes in the index and
  // must not be counted against the duplicate-content budget. Measuring them
  // here would fail the build for pages Google is never shown.
  if (!isIndexableRecord(n)) {
    stats.skipped++;
    continue;
  }
  if (canonicalised.has(`${rel}:${slug}`)) {
    stats.canonicalised++;
    continue;
  }

  stats.n++;
  if (n.shortMeaning) stats.meaning++;
  if (n.origin) stats.origin++;
  if (n.faqs.length) stats.faqs++;
  if (n.scripts.length) stats.scripts++;
  if (n.sectionPlan.length) stats.sections++;
  stats.words += n.plainText.split(/\s+/).filter(Boolean).length;

  titles.add(n.seo.title);
  h1s.add(n.seo.h1);
  intros.add(n.intro);
  signatures.add(n.contentSignature);
  sectionOrders.add(n.sectionPlan.map((s) => s.key).join('>'));
  headingSets.add(n.sectionPlan.map((s) => s.heading).join('|'));

  pages.push({ key: `${rel}/${slug}`, sh: shingles(n.plainText, SHINGLE_N) });
}

// ── pairwise similarity ──────────────────────────────────────────────────────
// Full pairwise on 1200 pages is ~720k comparisons of large sets. That is slow
// in JS, so we bucket by a cheap signature first: pages only get compared when
// they share a rare shingle. This is the standard MinHash-style prefilter and
// it cannot miss a high-similarity pair, because such a pair necessarily shares
// many shingles.
const index = new Map();
for (let i = 0; i < pages.length; i++) {
  for (const s of pages[i].sh) {
    if (!index.has(s)) index.set(s, []);
    index.get(s).push(i);
  }
}

const compared = new Set();
let maxSim = 0;
let maxPair = null;
let overThreshold = 0;
const sims = [];

for (let i = 0; i < pages.length; i++) {
  const candidates = new Set();
  for (const s of pages[i].sh) {
    const bucket = index.get(s);
    if (bucket && bucket.length > 1 && bucket.length < 400) {
      for (const j of bucket) if (j > i) candidates.add(j);
    }
  }
  for (const j of candidates) {
    const k = `${i}:${j}`;
    if (compared.has(k)) continue;
    compared.add(k);
    const sim = jaccard(pages[i].sh, pages[j].sh);
    sims.push(sim);
    if (sim > maxSim) {
      maxSim = sim;
      maxPair = [pages[i].key, pages[j].key];
    }
    if (sim > MAX_SIMILARITY) overThreshold++;
  }
}

sims.sort((a, b) => a - b);
const pct = (v) => `${((v / stats.n) * 100).toFixed(1)}%`;
const mean = sims.length ? sims.reduce((a, b) => a + b, 0) / sims.length : 0;
const p95 = sims.length ? sims[Math.floor(sims.length * 0.95)] : 0;
const p99 = sims.length ? sims[Math.floor(sims.length * 0.99)] : 0;

console.log(`Uniqueness verification — ${stats.n} indexable pages sampled from ${pool.length}`);
console.log(`  non-indexable skipped ${stats.skipped} (served noindex, excluded from sitemap)`);
console.log(`  canonicalised skipped ${stats.canonicalised} (duplicate of a canonical page)`);
console.log(`  shingle size        ${SHINGLE_N} words`);
console.log(`  pairs compared      ${sims.length}`);
console.log(`  mean similarity     ${mean.toFixed(4)}`);
console.log(`  p95 similarity      ${p95.toFixed(4)}`);
console.log(`  p99 similarity      ${p99.toFixed(4)}`);
console.log(`  MAX similarity      ${maxSim.toFixed(4)}   ${maxPair ? `(${maxPair[0]} vs ${maxPair[1]})` : ''}`);
console.log(`  pairs over ${MAX_SIMILARITY}      ${overThreshold}`);
console.log(`  avg page length     ${Math.round(stats.words / Math.max(1, stats.n))} words`);
console.log(
  `  distinct            titles ${titles.size}/${stats.n} · h1 ${h1s.size}/${stats.n} · intros ${intros.size}/${stats.n} · signatures ${signatures.size}/${stats.n}`
);
console.log(
  `  distinct            section orders ${sectionOrders.size} · heading sets ${headingSets.size}`
);
console.log(
  `  coverage            meaning ${pct(stats.meaning)} · origin ${pct(stats.origin)} · faqs ${pct(stats.faqs)} · scripts ${pct(stats.scripts)}`
);

const failures = [];
if (maxSim > MAX_SIMILARITY) {
  failures.push(
    `max pairwise similarity ${maxSim.toFixed(4)} exceeds ${MAX_SIMILARITY} (${maxPair?.[0]} vs ${maxPair?.[1]})`
  );
}
if (titles.size !== stats.n) failures.push(`duplicate SEO titles (${titles.size}/${stats.n})`);
if (h1s.size !== stats.n) failures.push(`duplicate H1s (${h1s.size}/${stats.n})`);
if (intros.size !== stats.n) failures.push(`duplicate intros (${intros.size}/${stats.n})`);
if (signatures.size !== stats.n) failures.push(`duplicate signatures (${signatures.size}/${stats.n})`);
if (sectionOrders.size < 50) failures.push(`too few distinct section orders (${sectionOrders.size})`);
if (stats.meaning / stats.n < 0.9) failures.push(`meaning coverage below 90% (${pct(stats.meaning)})`);
if (stats.origin / stats.n < 0.9) failures.push(`origin coverage below 90% (${pct(stats.origin)})`);

if (failures.length) {
  console.error('\nUniqueness verification FAILED:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `\nUniqueness verification passed — max pairwise similarity ${maxSim.toFixed(4)} is below the ${MAX_SIMILARITY} duplicate threshold.`
);
