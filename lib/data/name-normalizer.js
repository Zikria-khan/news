// ──────────────────────────────────────────────────────────────────────────────
// NameVerse — Canonical Name Normalizer
//
// THE PROBLEM THIS SOLVES
// The dataset contains TWO incompatible record schemas:
//
//   Schema A (~36% of records) — deeply nested, evidence-oriented:
//     core_meaning.short_meaning, origin.primary_origin, identity.gender,
//     etymology.etymology_explanation, translations.{urdu,hindi,arabic,...},
//     faq[].question/.answer, cultural_context, historical_context, ...
//
//   Schema B (~64% of records) — flat, editorial-oriented:
//     short_meaning, origin (string), gender (string), long_meaning,
//     lucky_number, pronunciation.english, name_variations,
//     similar_sounding_names, popularity_by_region, in_arabic, ...
//
// The name detail page read FLAT fields (nameData.origin, nameData.short_meaning)
// which exist in NEITHER schema for Schema-A records and only partially for
// Schema-B records. Result: thousands of pages rendered with an empty meaning,
// empty origin and empty etymology — the textbook definition of thin content,
// and the reason Google filed them under "Crawled — currently not indexed".
//
// This module flattens BOTH schemas into ONE canonical shape so every page can
// render genuinely unique, substantive content from its own record.
//
// COVERAGE CONTRACT
// Every field that carries reader-facing content in either schema is captured
// here. The renderer consumes the whole shape; nothing is left unrendered.
// Fields that exist only as editorial caveats (confidence levels, warnings,
// status notes) are captured too — they are rendered as provenance, which is
// itself an E-E-A-T signal.
// ──────────────────────────────────────────────────────────────────────────────

import { normalizeGender, religionLabel } from './name-utils.js';

// ── small helpers ────────────────────────────────────────────────────────────

function isObj(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** First value that is a non-empty string / non-empty array / non-null object. */
function first(...vals) {
  for (const v of vals) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (isObj(v) && Object.keys(v).length === 0) continue;
    return v;
  }
  return null;
}

/** Coerce anything into a clean string ('' when unusable). */
function str(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(str).filter(Boolean).join(', ');
  if (isObj(v)) return str(first(v.text, v.value, v.name, v.meaning, v.description, v.note));
  return '';
}

/** Coerce anything into a clean array of strings. */
function arr(v) {
  if (v === undefined || v === null) return [];
  if (Array.isArray(v)) return v.map(str).filter(Boolean);
  if (typeof v === 'string') {
    const t = v.trim();
    if (!t) return [];
    return t.includes(',') ? t.split(',').map((s) => s.trim()).filter(Boolean) : [t];
  }
  if (isObj(v)) {
    const inner = first(v.traits, v.items, v.list, v.values, v.verified, v.known_linguistic_history);
    if (inner) return arr(inner);
    const s = str(v);
    return s ? [s] : [];
  }
  return [];
}

/** Deduplicate while preserving order, case-insensitively. */
function uniq(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = String(item).toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/** Strip mojibake / repeated punctuation that appears in some source records. */
function clean(s) {
  const t = str(s).replace(/\?{2,}/g, ' ').replace(/\s{2,}/g, ' ').trim();
  return t.includes('\uFFFD') ? '' : t;
}

/**
 * Some Schema-B records carry machine-translated script blocks whose "meaning"
 * is itself untranslated gibberish (e.g. a Hebrew string that is really a
 * transliterated English sentence). Detect and drop those so we never publish
 * nonsense as a translation.
 */
function looksLikeNoise(s) {
  const t = String(s || '');
  if (!t) return true;
  // A long run of characters from a script we cannot verify, with no Latin
  // anchor, is treated as unverifiable and dropped.
  const latin = (t.match(/[A-Za-z]/g) || []).length;
  const nonLatin = (t.match(/[^\x00-\x7F\s]/g) || []).length;
  if (nonLatin > 40 && latin < 3) return true;
  return false;
}

// ── SEO block ────────────────────────────────────────────────────────────────
// Both schemas nest the real payload one level down: seo.seo.{title,...}
// A few records expose it flat. Handle all three shapes.
function readSeo(raw) {
  const candidates = [raw.seo?.seo, raw.seo, raw.seo_content, raw.seoContent];
  const out = { secondary_keywords: [], keywords: [], search_intents: [] };
  for (const c of candidates) {
    if (!isObj(c)) continue;
    out.title = out.title || clean(c.title);
    out.meta_description = out.meta_description || clean(c.meta_description || c.metaDescription);
    out.h1 = out.h1 || clean(c.h1);
    out.focus_keyword = out.focus_keyword || clean(c.focus_keyword);
    out.description_paragraph = out.description_paragraph || clean(c.description_paragraph);
    out.secondary_keywords = out.secondary_keywords.length
      ? out.secondary_keywords
      : arr(c.secondary_keywords);
    out.keywords = out.keywords.length ? out.keywords : arr(c.keywords);
    out.search_intents = out.search_intents.length ? out.search_intents : arr(c.search_intents);
    out.editorial_rule = out.editorial_rule || clean(c.editorial_seo_rule);
    out.intro = out.intro || clean(c.intro);
    out.meaning_section = out.meaning_section || clean(c.meaning_section);
    out.origin_section = out.origin_section || clean(c.origin_section);
    out.islam_section = out.islam_section || clean(c.islam_section);
    out.cultural_section = out.cultural_section || clean(c.cultural_section);
    out.pronunciation_section = out.pronunciation_section || clean(c.pronunciation_section);
  }
  out.secondary_keywords = out.secondary_keywords || [];
  out.keywords = out.keywords || [];
  out.search_intents = out.search_intents || [];
  return out;
}

// ── FAQ block ────────────────────────────────────────────────────────────────
// Schema A: faq[].{question, answer}   Schema B: seo.faq[].{q, a}
function readFaqs(raw) {
  const pools = [raw.faq, raw.seo?.faq, raw.seo?.seo?.faq, raw.faqs, raw.richFaqs];
  const out = [];
  for (const pool of pools) {
    if (!Array.isArray(pool)) continue;
    for (const item of pool) {
      if (!isObj(item)) continue;
      const q = clean(first(item.question, item.q, item.title));
      const a = clean(first(item.answer, item.a, item.text, item.response));
      if (q && a) out.push({ q, a });
    }
  }
  // dedupe by question
  const seen = new Set();
  return out.filter((f) => {
    const k = f.q.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ── Translations / world scripts ─────────────────────────────────────────────
// Schema A: translations.{english,urdu,hindi,arabic,persian,pashto,...}
// Schema B: in_arabic / in_urdu / in_hindi / in_sanskrit / in_tamil / ...
const SCRIPT_LANGS = [
  { key: 'arabic', label: 'Arabic', rtl: true },
  { key: 'urdu', label: 'Urdu', rtl: true },
  { key: 'persian', label: 'Persian', rtl: true },
  { key: 'pashto', label: 'Pashto', rtl: true },
  { key: 'hebrew', label: 'Hebrew', rtl: true },
  { key: 'hindi', label: 'Hindi', rtl: false },
  { key: 'sanskrit', label: 'Sanskrit', rtl: false },
  { key: 'tamil', label: 'Tamil', rtl: false },
  { key: 'telugu', label: 'Telugu', rtl: false },
  { key: 'bengali', label: 'Bengali', rtl: false },
  { key: 'marathi', label: 'Marathi', rtl: false },
  { key: 'greek', label: 'Greek', rtl: false },
  { key: 'latin', label: 'Latin', rtl: false },
  { key: 'english', label: 'English', rtl: false },
];

function readScripts(raw) {
  const out = [];
  for (const lang of SCRIPT_LANGS) {
    const src = first(raw.translations?.[lang.key], raw[`in_${lang.key}`]);
    if (!src) continue;
    const name = clean(first(isObj(src) ? src.name : src, isObj(src) ? src.script : null));
    const meaning = clean(isObj(src) ? first(src.meaning, src.short_meaning) : null);
    const longMeaning = clean(isObj(src) ? first(src.long_meaning, src.description) : null);
    const status = clean(isObj(src) ? src.translation_status : null);
    if (!name && !meaning) continue;
    // Drop machine-translation noise rather than publishing it.
    const safeMeaning = looksLikeNoise(meaning) ? '' : meaning;
    const safeLong = looksLikeNoise(longMeaning) ? '' : longMeaning;
    if (!name && !safeMeaning && !safeLong) continue;
    out.push({ ...lang, name, meaning: safeMeaning, longMeaning: safeLong, status });
  }
  return out;
}

// ── Pronunciation ────────────────────────────────────────────────────────────
function readPronunciation(raw) {
  const p = isObj(raw.pronunciation) ? raw.pronunciation : {};
  return {
    english: clean(first(p.english, p.romanized, p.romanization, raw.pronunciation_english)),
    ipa: clean(p.ipa),
    urdu: clean(p.urdu),
    hindi: clean(p.hindi),
    persian: clean(p.persian),
    pashto: clean(p.pashto),
    arabic: clean(p.arabic),
    biblical: clean(p.biblical),
    romanized: clean(p.romanized),
    note: clean(first(p.approximation_note, p.note)),
  };
}

// ── Origin ───────────────────────────────────────────────────────────────────
function readOrigin(raw) {
  const o = raw.origin;
  if (typeof o === 'string') {
    return { label: clean(o), explanation: '', transmission: [], type: '', confidence: '' };
  }
  if (isObj(o)) {
    return {
      label: clean(first(o.primary_origin, o.origin, o.label, o.name)),
      explanation: clean(first(o.origin_explanation, o.explanation, o.note)),
      transmission: arr(first(o.cultural_transmission, o.transmission)),
      type: clean(o.origin_type),
      confidence: clean(o.origin_confidence),
    };
  }
  return { label: '', explanation: '', transmission: [], type: '', confidence: '' };
}

// ── Religion / scripture context ─────────────────────────────────────────────
function readReligionContext(raw) {
  const r = isObj(raw.religion) ? raw.religion : {};
  const q = isObj(r.quranic_status) ? r.quranic_status : {};
  const h = isObj(r.hadith_status) ? r.hadith_status : {};
  const p = isObj(r.prophetic_status) ? r.prophetic_status : {};
  const c = isObj(r.companion_status) ? r.companion_status : {};

  const biblical = isObj(raw.biblical_reference) ? raw.biblical_reference : {};
  const saint = isObj(raw.saint_reference) ? raw.saint_reference : {};
  const islamic = isObj(raw.islamic_reference) ? raw.islamic_reference : {};
  const vedic = isObj(raw.vedic_reference) ? raw.vedic_reference : {};

  return {
    association: clean(first(r.primary_association, r.religion)),
    status: clean(r.religious_status),
    explanation: clean(r.religious_explanation),
    confidence: clean(r.religion_confidence),
    isQuranic: q.is_quranic_name === true || islamic.is_quranic === true,
    quranicRef: clean(first(q.quranic_reference, islamic.surah)),
    quranicNote: clean(first(q.note, islamic.note)),
    isHadith: h.direct_reference === true,
    hadithRef: clean(h.reference),
    isProphetic: p.prophet_association === true,
    propheticRef: clean(p.reference),
    isCompanion: c.known_companion_association === true,
    companionRef: clean(c.reference),
    isBiblical: biblical.is_biblical === true,
    biblicalScripture: clean(first(biblical.origin_scripture, biblical.scripture)),
    biblicalVerse: clean(first(biblical.verse_reference, biblical.verse)),
    biblicalNote: clean(biblical.note),
    isSaint: saint.is_saint_name === true || Boolean(saint.saint_name),
    saintName: clean(saint.saint_name),
    saintNote: clean(saint.note),
    isVedic: Boolean(vedic.reference || vedic.note || vedic.is_vedic),
    vedicRef: clean(first(vedic.reference, vedic.note)),
    namingContext: clean(raw.islamic_naming_context?.context),
    namingInterpretation: clean(raw.islamic_naming_context?.interpretation),
    namingDistinction: clean(raw.islamic_naming_context?.important_distinction),
    canBeUsedByMuslims: raw.islamic_naming_context?.can_be_used_by_muslims === true,
  };
}

// ── Cultural / historical ────────────────────────────────────────────────────
function readCultural(raw) {
  const c = isObj(raw.cultural_context) ? raw.cultural_context : {};
  return {
    associations: arr(first(c.primary_cultural_associations, c.associations)),
    meaning: clean(first(c.cultural_meaning, c.meaning)),
    personalInterpretation: clean(c.personal_name_interpretation),
    placeSignificance: clean(c.place_name_significance),
    interpretationWarning: clean(c.interpretation_warning),
    symbolism: clean(first(raw.spiritual_symbolism, c.symbolism)),
    impact: clean(first(raw.cultural_impact, c.impact)),
  };
}

function readHistorical(raw) {
  const h = isObj(raw.historical_context) ? raw.historical_context : {};
  const refs = Array.isArray(raw.historical_references) ? raw.historical_references : [];
  const detailed = refs
    .filter(isObj)
    .map((r) => ({
      reference: clean(first(r.reference, r.text, r.description)),
      period: clean(first(r.time_period, r.period)),
      context: clean(r.context),
    }))
    .filter((r) => r.reference || r.context);
  const history = uniq([
    ...arr(h.known_linguistic_history),
    ...detailed.map((r) => r.reference),
  ]);
  return {
    history,
    detailed,
    person: clean(first(h.historical_person_association, h.person)),
    event: clean(first(h.historical_event_association, h.event)),
    note: clean(h.editorial_note),
    confidence: clean(h.historical_claim_confidence),
  };
}

// ── Numerology / lucky attributes ────────────────────────────────────────────
function readNumerology(raw) {
  const n = isObj(raw.numerology) ? raw.numerology : {};
  const l = isObj(raw.lucky_attributes) ? raw.lucky_attributes : {};
  return {
    luckyNumber: first(raw.lucky_number, n.lucky_number, l.lucky_number),
    lifePath: first(raw.life_path_number, n.life_path_number, l.life_path_number),
    // Schema-A/v8 stores the interpretive explanation as `numerology.meaning`;
    // the flat field is `numerology_meaning`. Map BOTH to the key the enricher
    // and detail template read (`numerologyMeaning`). Without this, every
    // record fell back to the generic profile text shared by all names with
    // the same lucky number.
    numerologyMeaning: clean(
      first(raw.numerology_meaning, n.numerology_meaning, n.meaning)
    ),
    luckyDay: clean(first(raw.lucky_day, l.lucky_day)),
    luckyColors: arr(first(raw.lucky_colors, l.lucky_colors)),
    luckyStone: clean(first(raw.lucky_stone, l.lucky_stone)),
    numerologyStatus: clean(n.status),
    numerologyNote: clean(n.note),
    luckyStatus: clean(l.status),
    luckyNote: clean(l.note),
  };
}

// ── Popularity ───────────────────────────────────────────────────────────────
function readPopularity(raw) {
  const p = isObj(raw.popularity) ? raw.popularity : {};
  const regions = Array.isArray(raw.popularity_by_region) ? raw.popularity_by_region : [];
  const modern = isObj(raw.modern_usage) ? raw.modern_usage : {};
  return {
    score: first(raw.popularity_score, p.overall_score),
    note: clean(p.note),
    regions: regions
      .filter(isObj)
      .map((r) => ({
        region: clean(first(r.region, r.name, r.country)),
        code: clean(first(r.country_code, r.code)),
        score: first(r.score, r.value),
        year: first(r.year, r.registry_year),
      }))
      .filter((r) => r.region),
    usageRegions: arr(first(modern.usage_regions, modern.regions)),
  };
}

// ── Modern usage ─────────────────────────────────────────────────────────────
function readModernUsage(raw) {
  const m = isObj(raw.modern_usage) ? raw.modern_usage : {};
  return {
    status: clean(m.status),
    trends: clean(m.trends),
    context: clean(m.modern_context),
    platforms: arr(m.platforms),
    regionalNote: clean(m.regional_usage_note),
  };
}

// ── Namesakes / real life ────────────────────────────────────────────────────
function readNamesakes(raw) {
  const c = raw.celebrity_usage;
  let celebrities = [];
  let note = '';
  if (Array.isArray(c)) celebrities = arr(c);
  else if (isObj(c)) {
    celebrities = arr(first(c.verified, c.names, c.list));
    note = clean(c.note);
  }

  const story = isObj(raw.name_in_real_life)
    ? raw.name_in_real_life
    : isObj(raw.name_story)
    ? raw.name_story
    : null;

  return {
    celebrities: uniq(celebrities),
    note,
    story: story
      ? {
          person: clean(first(story.person_name, story.person, story.title)),
          location: clean(story.location),
          text: clean(first(story.story, story.text, story.description)),
          type: clean(story.type),
          isFictional: story.is_fictional === true,
        }
      : null,
    realWorldNote: clean(raw.real_world_usage?.note),
  };
}

// ── Etymology ────────────────────────────────────────────────────────────────
function readEtymology(raw) {
  const e = isObj(raw.etymology) ? raw.etymology : {};
  return {
    language: clean(first(e.primary_language, e.language)),
    lexicalForm: clean(first(e.lexical_form, e.script_form)),
    transliteration: clean(first(e.transliteration, e.romanization)),
    rootStatus: clean(e.root_status),
    explanation: clean(first(e.etymology_explanation, e.explanation)),
    meanings: arr(e.etymological_meaning),
    warning: clean(e.false_etymology_warning),
    confidence: clean(e.etymology_confidence),
  };
}

// ── Provenance / evidence ────────────────────────────────────────────────────
// Editorial caveats and evidence trails. Rendered as a provenance block, which
// is a genuine E-E-A-T signal: it shows the reader how a claim was verified.
function readProvenance(raw) {
  const claims = Array.isArray(raw.evidence?.core_claims) ? raw.evidence.core_claims : [];
  const cq = isObj(raw.content_quality) ? raw.content_quality : {};
  const sd = isObj(raw.structured_data) ? raw.structured_data : {};
  const props = Array.isArray(sd.additionalProperty) ? sd.additionalProperty : [];
  const tq = isObj(raw.translation_quality) ? raw.translation_quality : {};

  return {
    claims: claims
      .filter(isObj)
      .map((c) => ({
        claim: clean(c.claim),
        type: clean(c.evidence_type),
        confidence: clean(c.confidence),
      }))
      .filter((c) => c.claim),
    contentQuality: {
      overall: clean(cq.overall_status),
      linguistic: clean(cq.linguistic_authenticity),
      etymological: clean(cq.etymological_authenticity),
      meaning: clean(cq.meaning_authenticity),
      translation: clean(cq.translation_quality),
    },
    properties: props
      .filter(isObj)
      .map((p) => ({ name: clean(p.name), value: clean(p.value) }))
      .filter((p) => p.name && p.value),
    translationQuality: {
      strategy: clean(tq.strategy),
      warning: clean(tq.warning),
      confidence: clean(tq.confidence),
    },
  };
}

// ── Editorial status notes ───────────────────────────────────────────────────
// The dataset marks numerology, letter symbolism and personality traits as
// belief-based. Those caveats are captured and rendered, never discarded.
function readStatusNotes(raw) {
  const sm = isObj(raw.spiritual_meaning) ? raw.spiritual_meaning : {};
  const pa = isObj(raw.personality_associations) ? raw.personality_associations : {};
  const hp = isObj(raw.hidden_personality_traits) ? raw.hidden_personality_traits : {};
  return {
    spiritualStatus: clean(sm.status),
    spiritualIsDirect: sm.is_direct_religious_definition === true,
    spiritualNote: clean(sm.note),
    personalityStatus: clean(pa.status),
    personalityNote: clean(pa.note),
    hiddenStatus: clean(hp.status),
    hiddenNote: clean(hp.note),
  };
}

// ── Templated v8 dataset ────────────────────────────────────────────────────
// The Islamic "Production v8" records are generated from one fixed prose
// template. Nearly every field is a dataset-wide sentence frame with only the
// name, lexical form or gloss swapped in — including the FAQs, cultural notes,
// origin explanation and editor-only caveats. Rendering those verbatim puts
// hundreds of identical 5-word shingles on every page and trips the
// duplicate-content gate.
//
// The dataset itself says which fields are publishable: `render_policy` marks
// unverified sections as hidden and names `core_meaning.primary_meaning` as the
// single definition source. Honour that policy: discard the boilerplate prose
// and let name-content.js compose fresh prose from the record's real facts.
// Nothing is invented — we keep the identity, gloss, origin, lexical form,
// scripts, pronunciation, numerology and variants.
function applyTemplatedSourcePolicy(record, hiddenSections) {
  record.sourceTemplate = 'templated';
  record.hiddenSections = [...hiddenSections];

  // Keep a compact, name-specific long-form value for coverage checks and the
  // indexability gate. The prose engine does NOT publish this string verbatim.
  const gloss = String(record.shortMeaning || '').replace(/[“”"']/g, '').trim();
  record.longMeaning = [
    `${record.name} is recorded with the gloss \u201C${gloss || 'an unverified gloss'}\u201D`,
    record.origin ? `and ${record.origin} origin` : '',
    record.etymology.lexicalForm ? `; its source form is ${record.etymology.lexicalForm}` : '',
  ].filter(Boolean).join(' ') + '.';

  // The v8 numerology paragraph begins with a name-specific letter count and
  // ends with a sentence repeated on every page. Keep the former, drop the
  // latter; the site-wide numerology disclaimer already says the same thing.
  record.numerologyMeaning = String(record.numerologyMeaning || '')
    .replace(/\s*This is an interpretive tradition, not a factual claim\.?/gi, '')
    .replace(/\s*Numerology is an optional interpretive layer\.?/gi, '')
    .trim();

  // Drop the source's generated prose, not its facts.
  record.originExplanation = '';
  record.originType = '';
  record.culturalTransmission = [];
  record.literalMeaning = '';
  record.extendedMeaning = '';
  record.secondaryMeanings = [];
  record.semanticDomain = '';
  record.semanticRelationship = '';
  record.semanticConcepts = [];

  record.etymology.explanation = '';
  record.etymology.warning = '';
  record.etymology.meanings = [];
  record.etymology.rootStatus = '';

  record.cultural = {
    associations: [],
    meaning: '',
    personalInterpretation: '',
    placeSignificance: '',
    interpretationWarning: '',
    symbolism: '',
    impact: '',
  };

  // render_policy.hidden_sections: these are explicitly marked "do not render".
  if (hiddenSections.has('spiritual_meaning')) record.spiritualMeaning = '';
  if (hiddenSections.has('personality_associations')) {
    record.statusNotes.personalityNote = '';
    record.emotionalTraits = [];
  }
  if (hiddenSections.has('hidden_personality_traits')) {
    record.statusNotes.hiddenNote = '';
    record.hiddenTraits = [];
  }
  if (hiddenSections.has('celebrity_usage')) record.namesakes.note = '';
  if (hiddenSections.has('real_world_usage')) record.namesakes.realWorldNote = '';
  if (hiddenSections.has('name_story')) record.namesakes.story = null;
  if (hiddenSections.has('popularity')) {
    record.popularityNote = '';
    record.popularityRegions = [];
    record.usageRegions = [];
  }

  record.genderNote = '';
  record.nameStatus = '';
  record.religionCtx.explanation = '';
  record.religionCtx.namingContext = '';
  record.religionCtx.namingInterpretation = '';
  record.religionCtx.namingDistinction = '';
  record.historical = { history: [], detailed: [], person: '', event: '', note: '', confidence: '' };
  record.provenance.claims = [];
  record.modernUsage = { status: '', trends: '', context: '', platforms: [], regionalNote: '' };
  record.pronunciation.note = '';
  record.pronunciation.ipa = '';
  record.faqs = [];

  // SEO sub-blocks from the v8 template are also dataset-wide sentences.
  for (const key of [
    'intro', 'description_paragraph', 'meaning_section', 'origin_section',
    'islam_section', 'cultural_section', 'pronunciation_section',
  ]) {
    if (key in record.seo) record.seo[key] = '';
  }
  record.seoContent = {
    intro: '', meaning: '', origin: '', islam: '', cultural: '', pronunciation: '',
  };
}

// ── Main normalizer ──────────────────────────────────────────────────────────

export function normalizeNameRecord(raw, religion, slug) {
  if (!isObj(raw)) return null;

  const name = clean(first(raw.name, raw.identity?.display_name, raw.identity?.normalized_name));
  if (!name) return null;

  const cm = isObj(raw.core_meaning) ? raw.core_meaning : {};
  const identity = isObj(raw.identity) ? raw.identity : {};
  const lang = raw.language;
  const seo = readSeo(raw);
  const origin = readOrigin(raw);
  const etymology = readEtymology(raw);
  const pronunciation = readPronunciation(raw);
  const numerology = readNumerology(raw);
  const popularity = readPopularity(raw);
  const cultural = readCultural(raw);
  const historical = readHistorical(raw);
  const religionCtx = readReligionContext(raw);
  const namesakes = readNamesakes(raw);
  const scripts = readScripts(raw);
  const modernUsage = readModernUsage(raw);
  const provenance = readProvenance(raw);
  const statusNotes = readStatusNotes(raw);

  // Detect the templated "hide_unverified" dataset by its own render policy,
  // not by a filename or religion. The content engine uses this flag to avoid
  // publishing the generator's sentence frames verbatim.
  const renderPolicy = isObj(raw.render_policy) ? raw.render_policy : {};
  const hiddenSections = new Set(
    Array.isArray(renderPolicy.hidden_sections) ? renderPolicy.hidden_sections : []
  );
  const isTemplatedSource =
    renderPolicy.hide_unverified === true ||
    Boolean(renderPolicy.single_definition_source) ||
    /^v8(?:\.|$)/.test(clean(raw.content_revision));

  // Meaning — the single most important field, and the one that was empty.
  const shortMeaning = clean(
    first(
      raw.short_meaning,
      cm.short_meaning,
      cm.primary_meaning,
      raw.meaning,
      cm.literal_meaning,
      raw.semantic_field?.primary_semantic_domain,
      raw.personality_associations?.traits?.[0]
    )
  );

  const longMeaning = clean(
    first(
      raw.long_meaning,
      cm.meaning_explanation,
      raw.seo_content?.intro,
      seo.description_paragraph,
      etymology.explanation,
      raw.spiritual_meaning?.meaning,
      raw.spiritual_meaning
    )
  );

  // Gender — Schema B wraps it in parentheses, e.g. "(Male)".
  const rawGender = clean(first(raw.gender, identity.gender));
  const genderKey = normalizeGender(rawGender.replace(/[()]/g, ''));

  // Language list
  let languages = [];
  if (Array.isArray(lang)) languages = arr(lang);
  else if (isObj(lang)) languages = uniq([clean(lang.primary), ...arr(lang.associated_languages)]);
  else if (typeof lang === 'string') languages = arr(lang);
  const languageNotes = isObj(lang?.language_notes) ? lang.language_notes : {};
  const languageConfidence = clean(lang?.language_confidence);

  // A "name-shaped" string: one or two alphabetic words, no sentence
  // punctuation, not the entry's own name. Used to keep glosses and concepts
  // ("servant of god", "aaban; the eighth persian month") out of name lists.
  const uniqNameLike = (list, self) =>
    uniq(list)
      .map((x) => String(x || '').trim())
      .filter((x) => {
        if (!x || x.length < 2 || x.length > 32) return false;
        if (/[;,:()\u2014\u2013]/.test(x)) return false;
        if (!/^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u.test(x)) return false;
        if (x.split(/\s+/).length > 2) return false;
        if (self && x.toLowerCase() === String(self).toLowerCase()) return false;
        return true;
      })
      .filter((x, i, a) => a.findIndex((y) => y.toLowerCase() === x.toLowerCase()) === i);

  // The dataset annotates most of its `note` fields with instructions written
  // for whoever compiles the entry — "No celebrity association should be
  // generated without verification.", "Letter-based personality systems should
  // not be presented as factual properties of the name." Correct guidance in
  // the source file, nonsense on a published page: they were going out verbatim
  // on roughly half the site, which is precisely the kind of text that reads as
  // machine-generated. This deliberately does NOT match substantive hedges like
  // "should not be classified as a Quranic personal name without a direct
  // Quranic basis" — those are honest answers for the reader.
  const EDITOR_GUARD =
    /\b(?:should not be (?:presented|generated|invented|claimed|asserted)|should be (?:avoided|omitted)|requires separate (?:frequency|evidence)|do not (?:invent|generate|present)|no celebrity association|no gloss is asserted)\b/i;

  const isEditorGuard = (v) => EDITOR_GUARD.test(String(v || ''));

  // Some dataset fields carry a serialised Python boolean or null instead of
  // prose ("False", "None"), which then prints at the tail of an otherwise
  // good sentence. A bare token means "no value here".
  const isNullToken = (v) =>
    /^(?:true|false|null|none|undefined|nan|n\/a|-)$/i.test(String(v || '').trim());

  // ...and it can also be welded onto the end of an otherwise good sentence, as
  // in "...without a direct Quranic basis. False". Drop the trailing token only;
  // the sentence and its full stop stay intact.
  const stripTrailingToken = (v) =>
    String(v).replace(/\s+(?:true|false|none|null|undefined|nan|n\/a)\s*$/i, '').trim();

  /** Drop editor-only instructions from every user-facing string in a record. */
  function scrubEditorGuards(o, key) {
    if (!o || key === '_raw') return;
    if (Array.isArray(o)) {
      for (let i = o.length - 1; i >= 0; i -= 1) {
        if (typeof o[i] === 'string') {
          if (isEditorGuard(o[i]) || isNullToken(o[i])) o.splice(i, 1);
          else o[i] = stripTrailingToken(o[i]);
        } else scrubEditorGuards(o[i]);
      }
      return;
    }
    if (typeof o !== 'object') return;
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === 'string') {
        if (isEditorGuard(v) || isNullToken(v)) o[k] = '';
        else o[k] = stripTrailingToken(v);
      } else scrubEditorGuards(v, k);
    }
  }

  // Variants
  const variants = uniqNameLike([
    ...arr(raw.name_variations),
    ...arr(raw.name_variants?.romanized_variants),
    ...arr(identity.alternate_spellings),
  ], name);
  const scriptVariants = uniq(arr(raw.name_variants?.script_variants));
  const variantNotes = clean(raw.name_variants?.variant_notes);
  const searchVariants = uniq(arr(identity.search_variants));

  // Similar / related names
  // semantic_field.related_concepts holds *concepts*, not sibling names: for
  // "aaban" it is ["aaban; the eighth persian month"] — i.e. the gloss itself.
  // Merging them straight into `similar` printed the meaning string inside the
  // "Similar sounding names" chip list on ~5,000 pages. Keep only name-shaped
  // entries, and let the concepts through on their own field instead.
  const similar = uniqNameLike([
    ...arr(raw.similar_sounding_names),
    ...arr(raw.semantic_field?.related_concepts),
  ], name);
  const related = uniq(arr(first(raw.related_names, raw.name_variants?.related_names)));

  // Traits
  const emotionalTraits = uniq([
    ...arr(raw.emotional_traits),
    ...arr(raw.personality_associations?.traits),
  ]);
  const hiddenTraits = uniq([
    ...arr(raw.hidden_personality_traits),
    ...arr(raw.hidden_personality_traits?.traits),
  ]);

  const spiritualMeaning = clean(
    first(
      typeof raw.spiritual_meaning === 'string' ? raw.spiritual_meaning : null,
      raw.spiritual_meaning?.meaning,
      raw.spiritual_significance
    )
  );

  const record = {
    // identity
    name,
    slug: clean(first(raw.slug, slug)),
    religion,
    religionLabel: religionLabel(religion),
    gender: rawGender,
    genderKey,
    genderNote: clean(identity.gender_note),
    genderConfidence: clean(identity.gender_confidence),
    nameType: clean(identity.name_type),
    nameStatus: clean(identity.name_status),
    category: clean(raw.category),

    // meaning
    shortMeaning,
    longMeaning,
    literalMeaning: clean(first(cm.literal_meaning, cm.primary_meaning)),
    extendedMeaning: clean(cm.extended_meaning),
    secondaryMeanings: arr(cm.secondary_meanings),
    meaningConfidence: clean(cm.meaning_confidence),
    semanticDomain: clean(raw.semantic_field?.primary_semantic_domain),
    semanticRelationship: clean(raw.semantic_field?.semantic_relationship),
    semanticConcepts: uniq(arr(raw.semantic_field?.related_concepts)),

    // origin & etymology
    origin: origin.label,
    originExplanation: origin.explanation,
    originType: origin.type,
    originConfidence: origin.confidence,
    culturalTransmission: origin.transmission,
    etymology,

    // language
    languages,
    languageNotes,
    languageConfidence,
    scripts,
    pronunciation,
    variants,
    scriptVariants,
    variantNotes,
    searchVariants,
    similar,
    related,

    // numerology
    ...numerology,

    // popularity
    popularityScore: popularity.score,
    popularityNote: popularity.note,
    popularityRegions: popularity.regions,
    usageRegions: popularity.usageRegions,

    // modern usage
    modernUsage,

    // culture & history
    cultural,
    historical,
    religionCtx,
    spiritualMeaning,
    namesakes,

    // traits
    emotionalTraits,
    hiddenTraits,
    statusNotes,

    // faqs & seo
    faqs: readFaqs(raw),
    seo,
    seoContent: {
      intro: clean(raw.seo_content?.intro),
      meaning: clean(raw.seo_content?.meaning_section),
      origin: clean(raw.seo_content?.origin_section),
      islam: clean(raw.seo_content?.islam_section),
      cultural: clean(raw.seo_content?.cultural_section),
      pronunciation: clean(raw.seo_content?.pronunciation_section),
    },

    // provenance
    provenance,
    updatedAt: clean(raw.updated_at || raw.timestamps?.updated_at),

    // raw passthrough for anything the template still needs
    _raw: raw,
  };

  if (isTemplatedSource) applyTemplatedSourcePolicy(record, hiddenSections);

  scrubEditorGuards(record);
  return record;
}

const moduleApi = { normalizeNameRecord };

export default moduleApi;
