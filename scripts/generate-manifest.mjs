import fs from 'node:fs';
import path from 'node:path';
import { isIndexableRecord } from '../lib/data/indexability.js';
import { normalizeNameRecord } from '../lib/data/name-normalizer.js';
import { enrichNameProfile } from '../lib/data/name-enricher.js';

// ---------------------------------------------------------------------------
// Fix 3 — reconcile the manifest with the filesystem.
//
// The committed manifest advertised 42,310 names while only 13,802 JSON files
// existed on disk. The sitemaps are generated from the manifest, so they
// published ~28,508 URLs that 404 — each one burning a function invocation and
// poisoning crawl budget.
//
// This script derives the manifest EXCLUSIVELY from files that exist on disk,
// so the manifest can never describe a page that does not exist. It runs on
// every build via the `prebuild` npm script.
//
// REDESIGN NOTE — the manifest is also the data source for every HUB page
// (tradition hubs, gender hubs, letter hubs, NameCard). Two defects made those
// hubs render empty or broken:
//   1. `gender` was read only from the flat `data.gender` field. Schema-A
//      records keep it at `identity.gender`, so ALL 5,180 Islamic and 352
//      Italian names shipped with an empty gender and the gender hubs
//      (/islamic-boy-names etc.) filtered down to zero results.
//   2. `meaning` was empty for the Italian set and for every Schema-A record
//      whose meaning lives at `core_meaning.short_meaning`.
// Both are now resolved with ordered fallbacks, and gender is normalised to a
// canonical boy|girl|unisex token so hub filters are exact.
// ---------------------------------------------------------------------------

const ROOT = path.resolve(process.cwd());
const NAMES_DIR = path.join(ROOT, 'public', 'names');
const MANIFEST_PATH = path.join(ROOT, 'src', 'lib', 'data', 'names-manifest.json');

const VALID_RELIGIONS = ['islamic', 'christian', 'hindu', 'italian'];

function readJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'data' in parsed) return parsed.data;
    return parsed;
  } catch {
    return null;
  }
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function obj(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

// Canonical gender token. Schema-B wraps values in parentheses, e.g. "(Male)".
function normalizeGenderKey(value) {
  const g = String(value || '')
    .toLowerCase()
    .replace(/[()]/g, '')
    .trim();
  if (!g) return '';
  if (/unknown|unspecified|n\/a|not\s/.test(g)) return '';
  const isFemale = /female|girl|feminine/.test(g);
  const isMale = /(^|[^e])male|\bboy|masculin/.test(g);
  if (isMale && isFemale) return 'unisex';
  if (isFemale) return 'girl';
  if (isMale) return 'boy';
  if (/unisex|neutral|genderless/.test(g)) return 'unisex';
  return '';
}

const manifest = { islamic: [], christian: [], hindu: [], italian: [] };
let skipped = 0;

for (const rel of VALID_RELIGIONS) {
  const dir = path.join(NAMES_DIR, rel);
  if (!fs.existsSync(dir)) continue;

  const entries = fs
    .readdirSync(dir)
    .filter((entry) => entry.toLowerCase().endsWith('.json') && !entry.startsWith('_'));

  for (const entry of entries) {
    const slug = entry.replace(/\.json$/i, '');
    if (!slug) continue;

    const data = readJsonFile(path.join(dir, entry));
    if (!data) {
      skipped++;
      continue;
    }

    const identity = obj(data.identity);
    const coreMeaning = obj(data.core_meaning);
    const originValue = data.origin;
    const seoBlock = obj(obj(data.seo).seo).title ? obj(data.seo).seo : obj(data.seo);
    const seoContent = obj(data.seo_content);
    const semantic = obj(data.semantic_field);
    const etymology = obj(data.etymology);
    const popularity = obj(data.popularity);

    const meaning = firstString(
      data.short_meaning,
      data.meaning,
      coreMeaning.short_meaning,
      coreMeaning.primary_meaning,
      coreMeaning.literal_meaning,
      seoContent.intro,
      seoBlock.description_paragraph,
      semantic.primary_semantic_domain
    );
    const origin = firstString(
      data.origins,
      typeof originValue === 'string' ? originValue : '',
      originValue && originValue.primary_origin,
      etymology.primary_language
    );

    // Indexability is decided HERE, once, and carried on the manifest entry so
    // the sitemap, the detail page and the gates all read the same verdict.
    //
    // FIX — the verdict must be produced by the EXACT pipeline the detail page
    // uses: normalise -> enrich -> isIndexableRecord.
    //
    // This file used to judge the RAW source record (Boolean(meaning) &&
    // Boolean(origin) && !isNegativeAssertion(...)) while
    // app/names/[religion]/[slug]/page.jsx judged the ENRICHED record via
    // isIndexableRecord(enrichNameProfile(normalizeNameRecord(raw))). The two
    // disagreed on 1,919 of 13,801 records. ~857 of those ended up INSIDE the
    // sitemap while the page served `noindex, follow` — i.e. the site was
    // submitting URLs to Google and simultaneously telling Google not to index
    // them. GSC reports that as "Submitted URL marked 'noindex'"; at scale it
    // teaches Google that this sitemap is not a reliable crawl target, which is
    // exactly what a brand-new domain cannot afford during a migration.
    const indexable = isIndexableRecord(
      enrichNameProfile(normalizeNameRecord(data, rel, slug))
    );

    manifest[rel].push({
      name: firstString(data.name, identity.display_name),
      slug,
      religion: rel,
      meaning,
      origin,
      gender: normalizeGenderKey(firstString(data.gender, identity.gender)),
      category: firstString(data.category),
      popularity_score:
        Number(data.popularity_score) || Number(popularity.overall_score) || 0,
      indexable,
      // Content fingerprint — used below to detect records that are the SAME
      // name under two spellings. The lexical (script) form is the decisive
      // signal: two records that resolve to the same Arabic/Sanskrit/Hebrew
      // form ARE the same name. Meaning alone is NOT sufficient — many
      // unrelated names legitimately share a gloss like "God's grace", and
      // consolidating those would de-index genuinely distinct pages.
      _fp: (() => {
        const lex = firstString(etymology.lexical_form, etymology.script_form);
        if (!lex) return '';
        return `${lex}|${meaning}`.toLowerCase().replace(/\s+/g, '');
      })(),
    });
  }
}

// ── canonical consolidation ──────────────────────────────────────────────────
//
// The dataset contains pairs of records that are the same name under two
// transliterations — e.g. "Ayeshaan" and "Ayeza" both resolve to the Arabic
// form عيش, both gloss as "living, alive", and both carry the same root. Their
// pages are therefore substantively identical, and no amount of phrasing
// variation can make them unique, because the underlying facts are the same.
//
// Publishing both is the classic duplicate-content trap: Google picks one and
// ignores the other, and the ignored one drags on the domain's quality signal.
// The correct fix is canonical consolidation — one page is the canonical
// target, the other points at it with rel=canonical and is kept out of the
// sitemap. Both remain reachable, and the duplicate still passes link equity
// to the canonical page.
//
// The canonical member of each group is the one with the higher popularity
// score (ties broken by slug, so the choice is stable across builds).
for (const rel of VALID_RELIGIONS) {
  const groups = new Map();
  for (const item of manifest[rel]) {
    if (!item.indexable || !item._fp) continue;
    if (!groups.has(item._fp)) groups.set(item._fp, []);
    groups.get(item._fp).push(item);
  }
  for (const members of groups.values()) {
    if (members.length < 2) continue;
    const sorted = [...members].sort(
      (a, b) => (b.popularity_score || 0) - (a.popularity_score || 0) || a.slug.localeCompare(b.slug)
    );
    const canonical = sorted[0];
    for (const dup of sorted.slice(1)) {
      dup.canonicalSlug = canonical.slug;
      dup.indexable = false;
    }
  }
}

// ── cap indexable records ──────────────────────────────────────────────────
// "shrink the sitemap of mne to 1000 islamic famous and most fixed names 600 chrisitna and 500 hindu and push to github remvoe otehr from sitemap add no index"
const limits = { islamic: 1000, christian: 600, hindu: 500, italian: 0 };
for (const rel of VALID_RELIGIONS) {
  // Sort all items by popularity_score descending, then by slug
  const sorted = [...manifest[rel]].sort(
    (a, b) => (b.popularity_score || 0) - (a.popularity_score || 0) || a.slug.localeCompare(b.slug)
  );
  
  let indexableCount = 0;
  const limit = limits[rel] || 0;
  
  for (const item of sorted) {
    if (item.indexable) {
      if (indexableCount < limit) {
        indexableCount++;
      } else {
        item.indexable = false;
      }
    }
  }
}

// The fingerprint is an internal build artefact — strip it before writing.
for (const rel of VALID_RELIGIONS) {
  for (const item of manifest[rel]) delete item._fp;
}

fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest), 'utf8');

const total = Object.values(manifest).reduce((sum, arr) => sum + arr.length, 0);
const bytes = fs.statSync(MANIFEST_PATH).size;
console.log(
  `Manifest rebuilt from filesystem: ${total} names (${(bytes / 1024 / 1024).toFixed(2)} MB)` +
    (skipped ? ` — ${skipped} unreadable file(s) skipped` : '')
);
let totalIndexable = 0;
let totalCanonicalised = 0;
for (const [rel, items] of Object.entries(manifest)) {
  const withGender = items.filter((i) => i.gender).length;
  const withMeaning = items.filter((i) => i.meaning).length;
  const indexable = items.filter((i) => i.indexable).length;
  const canonicalised = items.filter((i) => i.canonicalSlug).length;
  totalIndexable += indexable;
  totalCanonicalised += canonicalised;
  console.log(
    `  ${rel}: ${items.length} names — ${withGender} gendered, ${withMeaning} with meaning, ${indexable} indexable, ${canonicalised} canonicalised`
  );
}
console.log(
  `  indexable total: ${totalIndexable} of ${total} (${((totalIndexable / total) * 100).toFixed(1)}%)`
);
console.log(`  canonicalised duplicates: ${totalCanonicalised}`);
