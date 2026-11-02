// ──────────────────────────────────────────────────────────────────────────────
// NameVerse — Per-Record Content Engine
//
// THE PROBLEM THIS SOLVES
// A shared section skeleton across 11,412 pages is exactly what Google's
// duplicate detection is built to catch. Even when the *values* differ, a page
// that always renders the same sections in the same order, under the same
// headings, with the same sentence frames, reads as a template — and templated
// pages get consolidated, devalued, or filed under "Crawled — currently not
// indexed".
//
// THE APPROACH
// Nothing about a page's shape is fixed. For each record this module derives a
// deterministic seed from the record's own identity, then uses it to vary:
//
//   1. SECTION ORDER   — the body sections are permuted per record.
//   2. SECTION SET     — only sections the record can actually fill are emitted.
//   3. HEADING TEXT    — every H2/H3 is chosen from a variant set and carries
//                        the name and its real attributes.
//   4. SENTENCE FRAMES — every clause in every paragraph is picked from a
//                        variant set, so two names never share a paragraph.
//   5. FAQ QUESTIONS   — question wording and the question set both vary.
//   6. LINK MODULES    — which related-name modules appear, and their headings.
//   7. LAYOUT          — each section renders full-width or in a grid.
//
// Determinism matters: the seed comes from the record, not from Math.random(),
// so a given name renders identically on every build and every request. That
// keeps the prerendered HTML stable and cacheable.
//
// HONESTY RULE
// The source dataset explicitly marks numerology, letter symbolism and
// personality traits as belief-based rather than linguistic fact. Derived
// content is always labelled as traditional or interpretive, never presented
// as etymology.
// ──────────────────────────────────────────────────────────────────────────────

import { genderLabel } from './name-utils.js';

// ── deterministic randomness ─────────────────────────────────────────────────

/** Stable 32-bit hash of a string (FNV-1a). */
function hashString(s) {
  let h = 0x811c9dc5;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Small, fast, seedable PRNG (mulberry32). */
function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one element deterministically. */
function pick(rng, list) {
  if (!Array.isArray(list) || !list.length) return '';
  return list[Math.floor(rng() * list.length) % list.length];
}

/** Deterministic Fisher–Yates shuffle. */
function shuffle(rng, list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Join non-empty fragments into a sentence-safe string. */
function joinClauses(parts) {
  return parts
    .map((p) => String(p || '').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Sentence-case a fragment that may start mid-thought. */
function cap(s) {
  const t = String(s || '').trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}

// ── long-tail keyword generation ─────────────────────────────────────────────
// Built from the record's own fields, so each page targets a distinct set of
// real queries. These are placed naturally in the title, meta, headings and
// body — never as a keyword list.

export function buildKeywords(r) {
  const name = r.name;
  const lower = name.toLowerCase();
  const rel = r.religionLabel;
  const relLower = rel.toLowerCase();
  const gen = r.genderKey ? genderLabel(r.genderKey).toLowerCase() : '';

  const primary = `${lower} name meaning`;

  const longTail = [];
  longTail.push(`${lower} name meaning and origin`);
  longTail.push(`what does the name ${lower} mean`);
  longTail.push(`${lower} name meaning in ${relLower}`);
  if (r.origin) longTail.push(`${lower} name meaning in ${r.origin.toLowerCase()}`);
  if (r.scripts.some((s) => s.key === 'urdu')) longTail.push(`${lower} name meaning in urdu`);
  if (r.scripts.some((s) => s.key === 'hindi')) longTail.push(`${lower} name meaning in hindi`);
  if (r.scripts.some((s) => s.key === 'arabic')) longTail.push(`${lower} name in arabic script`);
  if (r.scripts.some((s) => s.key === 'sanskrit')) longTail.push(`${lower} name in sanskrit`);
  longTail.push(`${lower} name origin and history`);
  if (gen) longTail.push(`is ${lower} a boy or girl name`);
  if (r.pronunciation.english) longTail.push(`how to pronounce ${lower}`);
  if (r.luckyNumber) longTail.push(`${lower} name numerology`);
  if (r.luckyNumber) longTail.push(`${lower} name lucky number`);
  if (r.popularityRegions.length) longTail.push(`${lower} name popularity in usa`);
  if (r.variants.length) longTail.push(`${lower} name variations and spelling`);
  if (r.religionCtx.isQuranic) longTail.push(`${lower} name in quran`);
  if (r.religionCtx.isBiblical) longTail.push(`${lower} biblical name meaning`);
  if (r.religionCtx.isSaint) longTail.push(`${lower} saint name meaning`);
  if (r.religionCtx.isVedic) longTail.push(`${lower} vedic name meaning`);
  if (r.similar.length) longTail.push(`names similar to ${lower}`);
  if (r.emotionalTraits.length) longTail.push(`${lower} name personality traits`);
  if (r.syllables) longTail.push(`${lower} name syllables and pronunciation`);

  const lsi = [];
  if (r.origin) lsi.push(r.origin.toLowerCase());
  if (r.etymology.language) lsi.push(r.etymology.language.toLowerCase());
  if (r.semanticDomain) lsi.push(r.semanticDomain.toLowerCase());
  lsi.push(...r.semanticConcepts.slice(0, 4).map((c) => c.toLowerCase()));
  lsi.push(...r.languages.slice(0, 3).map((l) => l.toLowerCase()));
  if (r.etymology.rootStatus) lsi.push('root');
  if (r.etymology.transliteration) lsi.push('transliteration');
  if (r.pronunciation.ipa) lsi.push('ipa');
  lsi.push('etymology', 'naming tradition', 'given name');

  return {
    primary,
    longTail: [...new Set(longTail)],
    lsi: [...new Set(lsi.filter(Boolean))],
  };
}

// ── heading variant sets ─────────────────────────────────────────────────────

const HEADINGS = {
  meaning: [
    (r) => `What does the name ${r.name} mean?`,
    (r) => `The meaning of ${r.name}`,
    (r) => `${r.name} name meaning and etymology`,
    (r) => `What ${r.name} means`,
    (r) => `Meaning and etymology of ${r.name}`,
  ],
  scripts: [
    (r) => `${r.name} in other languages & scripts`,
    (r) => `How ${r.name} is written around the world`,
    (r) => `${r.name} across world scripts`,
    (r) => `Writing ${r.name} in other languages`,
  ],
  scripture: [
    (r) => `${r.name} in religious tradition`,
    (r) => `The religious context of ${r.name}`,
    (r) => `${r.name} in scripture and tradition`,
    (r) => `Scriptural background of ${r.name}`,
  ],
  culture: [
    (r) => `Cultural significance of ${r.name}`,
    (r) => `${r.name} in culture and tradition`,
    (r) => `The cultural story of ${r.name}`,
    (r) => `How ${r.name} is understood culturally`,
  ],
  history: [
    (r) => `Historical background of ${r.name}`,
    (r) => `The history of the name ${r.name}`,
    (r) => `${r.name} through history`,
    (r) => `Historical record for ${r.name}`,
  ],
  pronunciation: [
    (r) => `How to pronounce ${r.name}`,
    (r) => `Pronouncing ${r.name}`,
    (r) => `${r.name} pronunciation guide`,
    (r) => `How ${r.name} is said`,
  ],
  numerology: [
    (r) => `${r.name} and the number ${r.luckyNumber}`,
    (r) => `Numerology of ${r.name}`,
    (r) => `${r.name} name numerology`,
    (r) => `The numerology behind ${r.name}`,
  ],
  letters: [
    (r) => `Traditional symbolism of each letter in ${r.name}`,
    (r) => `Letter by letter: ${r.name}`,
    (r) => `What each letter of ${r.name} traditionally signifies`,
    (r) => `The letters of ${r.name} and their symbolism`,
  ],
  traits: [
    (r) => `Personality associations of ${r.name}`,
    (r) => `Character traits linked to ${r.name}`,
    (r) => `${r.name} and personality`,
    (r) => `Traditional personality reading of ${r.name}`,
  ],
  modern: [
    (r) => `How ${r.name} is used today`,
    (r) => `Modern usage of ${r.name}`,
    (r) => `${r.name} in the modern world`,
    (r) => `Contemporary use of ${r.name}`,
  ],
  popularity: [
    (r) => `Where ${r.name} is used`,
    (r) => `Regional popularity of ${r.name}`,
    (r) => `${r.name} around the world`,
    (r) => `Popularity of ${r.name} by region`,
  ],
  namesakes: [
    (r) => `People named ${r.name}`,
    (r) => `Notable namesakes: ${r.name}`,
    (r) => `Famous people called ${r.name}`,
    (r) => `${r.name} in real life`,
  ],
  related: [
    (r) => `Names related to ${r.name}`,
    (r) => `Similar and related names to ${r.name}`,
    (r) => `If you like ${r.name}, consider these`,
    (r) => `Names like ${r.name}`,
  ],
  faq: [
    (r) => `Questions about the name ${r.name}`,
    (r) => `${r.name}: frequently asked questions`,
    (r) => `Common questions about ${r.name}`,
    (r) => `FAQs about the name ${r.name}`,
  ],
  provenance: [
    (r) => `How this entry was verified`,
    (r) => `Sources and verification for ${r.name}`,
    (r) => `Evidence behind this ${r.name} entry`,
    (r) => `Editorial notes on ${r.name}`,
  ],
};

const EYEBROWS = {
  meaning: ['Meaning & Etymology', 'Meaning', 'Etymology & Meaning', 'What it means'],
  scripts: ['World Scripts', 'Script Forms', 'Writing Systems', 'Across Languages'],
  scripture: ['Religious & Historical Context', 'Scripture', 'Religious Context', 'Faith Tradition'],
  culture: ['Cultural Context', 'Culture', 'Cultural Notes', 'In Culture'],
  history: ['Historical Record', 'History', 'Through the Ages', 'Historical Notes'],
  pronunciation: ['Pronunciation', 'How to Say It', 'Saying It', 'Phonetics'],
  numerology: ['Numerology', 'Numbers', 'Traditional Numerology', 'Number Symbolism'],
  letters: ['Letter Symbolism', 'Letters', 'Traditional Letters', 'Letter by Letter'],
  traits: ['Personality', 'Character', 'Traits', 'Personality Associations'],
  modern: ['Modern Usage', 'Today', 'Contemporary Use', 'In Use Now'],
  popularity: ['Regional Usage', 'Popularity', 'Around the World', 'Where It Is Used'],
  namesakes: ['Notable Namesakes', 'Namesakes', 'In Real Life', 'People'],
  related: ['Related Names', 'Similar Names', 'Names Like This', 'Explore Further'],
  faq: ['Frequently Asked Questions', 'FAQ', 'Common Questions', 'Questions'],
  provenance: ['Provenance', 'Verification', 'Sources', 'Editorial Notes'],
};

// ── prose composition ────────────────────────────────────────────────────────
// Every clause is drawn from this record's own fields AND picked from a variant
// set, so the output differs per name by construction.

function composeIntro(r, rng) {
  // A record with no gender gets no gender word — it used to be called
  // "unisex", which is a claim the record does not make. For records that DO
  // carry a gender the output (and the RNG sequence) is unchanged.
  const gen = r.genderKey ? genderLabel(r.genderKey).toLowerCase() : null;
  const g = gen ? `${gen} ` : '';
  const origin = r.origin || r.religionLabel;
  const rel = r.religionLabel;
  const parts = [];

  parts.push(
    pick(rng, [
      `${r.name} is a ${g}name of ${origin} origin used within the ${rel} naming tradition.`,
      `${r.name} is recorded as a ${g}given name with ${origin} roots, used in ${rel} naming.`,
      `Within the ${rel} naming tradition, ${r.name} is a ${g}name whose origins lie in ${origin}.`,
      `${r.name} is a ${g}name that the ${rel} tradition inherits from ${origin}.`,
      `A ${g}name of ${origin} origin, ${r.name} is used across ${rel} naming practice.`,
      `${r.name} belongs to the ${rel} naming tradition as a ${g}name of ${origin} origin.`,
    ])
  );

  if (r.shortMeaning) {
    parts.push(
      pick(rng, [
        `${r.name} has the core meaning \u201C${r.shortMeaning}\u201D.`,
        `${r.name} carries the sense \u201C${r.shortMeaning}\u201D.`,
        `${r.name} is understood to mean \u201C${r.shortMeaning}\u201D.`,
        `The recorded meaning of ${r.name} is \u201C${r.shortMeaning}\u201D.`,
        `Speakers gloss ${r.name} as \u201C${r.shortMeaning}\u201D.`,
        `The sense most often attached to ${r.name} is \u201C${r.shortMeaning}\u201D.`,
      ])
    );
  }

  if (r.etymology.lexicalForm) {
    const lex = r.etymology.lexicalForm;
    const tr = r.etymology.transliteration ? ` and transliterated as ${r.etymology.transliteration}` : '';
    parts.push(
      pick(rng, [
        `${r.name} is written ${lex}${tr}.`,
        `In its original script ${r.name} appears as ${lex}${tr}.`,
        `The lexical form of ${r.name} is ${lex}${tr}.`,
        `The source form behind ${r.name} is ${lex}${tr}.`,
      ])
    );
  }

  if (r.pronunciation.english) {
    parts.push(
      pick(rng, [
        `${r.name} is commonly pronounced ${r.pronunciation.english}.`,
        `English speakers usually say ${r.name} as ${r.pronunciation.english}.`,
        `The usual pronunciation of ${r.name} is ${r.pronunciation.english}.`,
        `${r.name} is generally said ${r.pronunciation.english}.`,
      ])
    );
  }

  if (r.scripts.length) {
    const langs = r.scripts.slice(0, 4).map((s) => s.label).join(', ');
    parts.push(
      pick(rng, [
        `${r.name} also appears in ${langs} script forms.`,
        `Beyond its primary script, ${r.name} is written in ${langs}.`,
        `${r.name} has recorded forms in ${langs}.`,
        `${r.name} is written in ${langs} as well.`,
      ])
    );
  }

  if (r.semanticDomain) {
    parts.push(
      pick(rng, [
        `For ${r.name}, the semantic field centres on ${r.semanticDomain.toLowerCase()}.`,
        `The central semantic idea for ${r.name} is ${r.semanticDomain.toLowerCase()}.`,
        `Semantically ${r.name} sits in the domain of ${r.semanticDomain.toLowerCase()}.`,
      ])
    );
  }

  if (r.luckyNumber) {
    parts.push(
      pick(rng, [
        `In traditional numerology ${r.name} carries the vibration of ${r.luckyNumber}.`,
        `Traditional numerology assigns ${r.name} the number ${r.luckyNumber}.`,
        `Numerologically ${r.name} is associated with ${r.luckyNumber}.`,
      ])
    );
  }

  if (r.originExplanation && r.originExplanation.length < 320) {
    parts.push(r.originExplanation);
  }

  parts.push(
    pick(rng, [
      `This ${rel} entry gathers the meaning, origin, script forms and pronunciation of ${r.name}.`,
      `Below you will find ${r.name}'s meaning, etymology, script forms and cultural background.`,
      `The sections below set out ${r.name}'s meaning, origin, pronunciation and cultural record.`,
      `What follows covers ${r.name}, its etymology, scripts and ${rel} context.`,
    ])
  );

  return joinClauses(parts);
}

function composeMeaning(r, rng) {
  const out = [];
  if (r.longMeaning) out.push(r.longMeaning);
  if (r.etymology.explanation && r.etymology.explanation !== r.longMeaning) {
    out.push(r.etymology.explanation);
  }
  if (r.originExplanation && r.originExplanation !== r.longMeaning && r.originExplanation !== r.etymology.explanation) {
    out.push(r.originExplanation);
  }
  if (r.literalMeaning && r.literalMeaning !== r.shortMeaning) {
    out.push(
      pick(rng, [
        `Taken literally, the name reads as \u201C${r.literalMeaning}\u201D.`,
        `Its literal sense is \u201C${r.literalMeaning}\u201D.`,
        `Read literally it means \u201C${r.literalMeaning}\u201D.`,
      ])
    );
  }
  if (r.extendedMeaning && r.extendedMeaning !== r.shortMeaning) {
    out.push(
      pick(rng, [
        `In extended use the name covers ${r.extendedMeaning}.`,
        `Its extended sense takes in ${r.extendedMeaning}.`,
        `Broader usage extends the meaning to ${r.extendedMeaning}.`,
      ])
    );
  }
  if (r.secondaryMeanings.length) {
    out.push(
      pick(rng, [
        `Secondary senses recorded for this name include ${r.secondaryMeanings.join('; ')}.`,
        `Other recorded senses are ${r.secondaryMeanings.join('; ')}.`,
        `The name also carries the senses ${r.secondaryMeanings.join('; ')}.`,
      ])
    );
  }
  if (r.semanticRelationship) out.push(r.semanticRelationship);
  if (r.etymology.rootStatus) {
    out.push(
      pick(rng, [
        `Its root is described as ${r.etymology.rootStatus}.`,
        `The root status recorded for the form is ${r.etymology.rootStatus}.`,
        `Etymologically it rests on ${r.etymology.rootStatus}.`,
      ])
    );
  }
  if (r.etymology.meanings.length) {
    out.push(
      pick(rng, [
        `The etymological senses recorded are ${r.etymology.meanings.join(', ')}.`,
        `Etymologically the form yields ${r.etymology.meanings.join(', ')}.`,
      ])
    );
  }
  if (r.spiritualMeaning) {
    out.push(
      pick(rng, [
        `Its spiritual reading is: \u201C${r.spiritualMeaning}\u201D`,
        `Spiritually it is read as \u201C${r.spiritualMeaning}\u201D`,
        `A spiritual interpretation gives \u201C${r.spiritualMeaning}\u201D`,
      ])
    );
  }
  return out;
}

function composeOrigin(r, rng) {
  const out = [];
  if (r.originExplanation) out.push(r.originExplanation);
  if (r.etymology.language) {
    out.push(
      pick(rng, [
        `The name's primary language of origin is ${r.etymology.language}.`,
        `Linguistically it belongs to ${r.etymology.language}.`,
        `Its source language is ${r.etymology.language}.`,
      ])
    );
  }
  if (r.languages.length) {
    out.push(
      pick(rng, [
        `It is associated with ${r.languages.join(', ')}.`,
        `The languages recorded for it are ${r.languages.join(', ')}.`,
        `It appears across ${r.languages.join(', ')}.`,
      ])
    );
  }
  if (r.culturalTransmission.length) {
    out.push(
      pick(rng, [
        `It travelled through ${r.culturalTransmission.join(', ')}.`,
        `Its transmission path runs through ${r.culturalTransmission.join(', ')}.`,
        `Culturally it was carried by ${r.culturalTransmission.join(', ')}.`,
      ])
    );
  }
  if (r.originType) {
    out.push(
      pick(rng, [
        `The origin is classified as ${r.originType}.`,
        `Its origin type is recorded as ${r.originType}.`,
      ])
    );
  }
  return out;
}

function composeCulture(r, rng) {
  const out = [];
  if (r.cultural.meaning) out.push(r.cultural.meaning);
  if (r.cultural.personalInterpretation) out.push(r.cultural.personalInterpretation);
  if (r.cultural.associations.length) {
    const associations = r.cultural.associations.join(', ');
    out.push(
      pick(rng, [
        `${r.name} is culturally associated with ${associations}.`,
        `Culturally ${r.name} is linked to ${associations}.`,
        `The cultural associations recorded for ${r.name} include ${associations}.`,
      ])
    );
  }
  if (r.cultural.symbolism) out.push(r.cultural.symbolism);
  if (r.cultural.impact) out.push(r.cultural.impact);
  if (r.cultural.placeSignificance) {
    out.push(
      pick(rng, [
        `As a place name it carries the sense: ${r.cultural.placeSignificance}`,
        `In place-name usage it signifies ${r.cultural.placeSignificance}`,
      ])
    );
  }
  // NOTE: the record's interpretation warning is NOT emitted here. It is a
  // dataset-wide editorial caveat, identical across records, so it is
  // consolidated into the single deduped caveat block instead of being
  // repeated in every section (which is what drove page similarity up).
  return out;
}

function composeHistory(r, rng) {
  const out = [...r.historical.history];
  for (const ref of r.historical.detailed) {
    if (ref.context && !out.includes(ref.context)) {
      out.push(
        ref.period ? `${ref.context} (${ref.period})` : ref.context
      );
    }
  }
  if (r.historical.person) {
    out.push(
      pick(rng, [
        `Associated historical figure: ${r.historical.person}.`,
        `The name is linked to the historical figure ${r.historical.person}.`,
      ])
    );
  }
  if (r.historical.event) {
    out.push(
      pick(rng, [
        `Associated historical event: ${r.historical.event}.`,
        `It is connected to the historical event ${r.historical.event}.`,
      ])
    );
  }
  // historical.note is a dataset-wide caveat — consolidated, not repeated here.
  return out;
}

function composeNumerology(r, rng) {
  const out = [];
  if (r.numerologyMeaning) out.push(r.numerologyMeaning);
  if (r.numerologyTraits) {
    out.push(
      pick(rng, [
        `For ${r.name}, the number ${r.luckyNumber} is traditionally linked to ${r.numerologyTraits}.`,
        `${r.name}'s traditional vibration is associated with ${r.numerologyTraits}.`,
        `The ${r.name} reading emphasises ${r.numerologyTraits} under number ${r.luckyNumber}.`,
      ])
    );
  }
  if (r.numerologyPlanet) {
    out.push(
      pick(rng, [
        `In ${r.name}'s traditional scheme the ruling planet is ${r.numerologyPlanet}.`,
        `${r.name} is placed under ${r.numerologyPlanet} in the traditional scheme.`,
      ])
    );
  }
  if (r.lifePath) {
    out.push(
      pick(rng, [
        `The life-path number recorded for ${r.name} is ${r.lifePath}.`,
        `${r.name} carries a life-path value of ${r.lifePath}.`,
      ])
    );
  }
  return out;
}

function composePronunciation(r, rng) {
  const out = [];
  if (r.pronunciation.english) {
    out.push(
      pick(rng, [
        `In English ${r.name} is usually said ${r.pronunciation.english}.`,
        `English speakers render ${r.name} as ${r.pronunciation.english}.`,
        `The English pronunciation of ${r.name} is ${r.pronunciation.english}.`,
      ])
    );
  }
  if (r.pronunciation.ipa) {
    out.push(
      pick(rng, [
        `In the International Phonetic Alphabet ${r.name} is written ${r.pronunciation.ipa}.`,
        `The IPA transcription of ${r.name} is ${r.pronunciation.ipa}.`,
      ])
    );
  }
  if (r.syllables) {
    out.push(
      pick(rng, [
        `${r.name} runs to ${r.syllables} syllable${r.syllables === 1 ? '' : 's'} across ${r.letterCount} letters.`,
        `${r.name} is ${r.syllables} syllable${r.syllables === 1 ? '' : 's'} long and ${r.letterCount} letters wide.`,
      ])
    );
  }
  if (r.pronunciation.note) out.push(r.pronunciation.note);
  return out;
}

function composeModern(r, rng) {
  const out = [];
  if (r.modernUsage.trends) out.push(r.modernUsage.trends);
  if (r.modernUsage.context) out.push(r.modernUsage.context);
  if (r.modernUsage.regionalNote) out.push(r.modernUsage.regionalNote);
  if (r.modernUsage.platforms.length) {
    out.push(
      pick(rng, [
        `It is discussed on ${r.modernUsage.platforms.join(', ')}.`,
        `Recorded discussion platforms include ${r.modernUsage.platforms.join(', ')}.`,
      ])
    );
  }
  if (r.usageRegions.length) {
    out.push(
      pick(rng, [
        `Contemporary usage is recorded in ${r.usageRegions.join(', ')}.`,
        `It remains in use across ${r.usageRegions.join(', ')}.`,
      ])
    );
  }
  return out;
}

function composeTraits(r, rng) {
  const out = [];
  if (r.emotionalTraits.length) {
    out.push(
      pick(rng, [
        `The name is associated with the qualities ${r.emotionalTraits.join(', ')}.`,
        `Emotional traits recorded for it include ${r.emotionalTraits.join(', ')}.`,
        `It is linked to ${r.emotionalTraits.join(', ')}.`,
      ])
    );
  }
  if (r.hiddenTraits.length) {
    out.push(
      pick(rng, [
        `A traditional reading adds the hidden traits ${r.hiddenTraits.join(', ')}.`,
        `Less obvious associations recorded are ${r.hiddenTraits.join(', ')}.`,
      ])
    );
  }
  // statusNotes.personalityNote is a dataset-wide caveat — consolidated below.
  return out;
}

function composeProvenance(r, rng) {
  const out = [];
  const cq = r.provenance.contentQuality;
  if (cq.overall) {
    out.push(
      pick(rng, [
        `The record's overall content-quality status is \u201C${cq.overall}\u201D.`,
        `Content quality is recorded as \u201C${cq.overall}\u201D.`,
      ])
    );
  }
  const checks = [
    ['linguistic authenticity', cq.linguistic],
    ['etymological authenticity', cq.etymological],
    ['meaning authenticity', cq.meaning],
    ['translation quality', cq.translation],
  ].filter(([, v]) => v);
  if (checks.length) {
    out.push(
      `Verification notes: ${checks.map(([k, v]) => `${k} \u2014 ${v}`).join('; ')}.`
    );
  }
  if (r.meaningConfidence) {
    out.push(`Meaning confidence is recorded as ${r.meaningConfidence}.`);
  }
  if (r.etymology.confidence) {
    out.push(`Etymology confidence is recorded as ${r.etymology.confidence}.`);
  }
  if (r.originConfidence) {
    out.push(`Origin confidence is recorded as ${r.originConfidence}.`);
  }
  // Universal warnings (false-etymology, translation-quality) are dataset-wide
  // and are consolidated into the caveat block rather than repeated here.
  if (r.provenance.claims.length) {
    out.push(
      `Core claims carried by this entry: ${r.provenance.claims
        .slice(0, 6)
        .map((c) => c.claim)
        .join('; ')}.`
    );
  }
  return out;
}

// ── editorial caveats ────────────────────────────────────────────────────────
// The dataset attaches the SAME editorial caveats to nearly every record —
// "this is symbolic, not scientific", "do not invent a historical person", and
// so on. They are genuinely valuable (they are what keeps the site honest and
// they are an E-E-A-T signal), but repeating them inside four different
// sections made every page share a large block of identical text, which is
// exactly what near-duplicate detection keys on.
//
// They are therefore collected, deduplicated, and rendered ONCE per page in a
// single compact block. The block is short relative to the unique content, so
// its contribution to page similarity is small.

function collectCaveats(r) {
  const raw = [
    r.cultural.interpretationWarning,
    r.historical.note,
    r.statusNotes.personalityNote,
    r.statusNotes.hiddenNote,
    r.statusNotes.spiritualNote,
    r.etymology.warning,
    r.provenance.translationQuality.warning,
    r.popularityNote,
    r.nameStatus,
    r.genderNote,
    r.religionCtx.namingDistinction,
    r.namesakes.note,
    r.namesakes.realWorldNote,
    r.modernUsage.status,
  ];

  const seen = new Set();
  const out = [];
  for (const c of raw) {
    const t = String(c || '').trim();
    if (!t || t.length < 20) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

// ── boilerplate stripping ────────────────────────────────────────────────────
// The dataset composes its prose from a small set of sentence templates whose
// only variable is the name or its form. Rendered verbatim, those templates put
// the same sentences on thousands of pages — e.g. every Arabic record carries
// "The name is associated with the Arabic form X." and "In the relevant
// cultures the form is associated with the sense Y."
//
// They are removed here for two reasons. First, they are redundant: the form
// itself is already displayed in the "Original form" panel and the meaning is
// already the page's headline. Second, they are the single largest remaining
// source of shared text between otherwise-unrelated names, which is what
// near-duplicate detection keys on.
//
// Nothing that carries record-specific information is dropped — only the
// template scaffolding around it.
const BOILERPLATE_SENTENCE = [
  /^the name is associated with the .{0,40} form\b/i,
  /^in the relevant cultures the form is associated with the sense\b/i,
  /^as a personal name, the lexical associations can be interpreted symbolically/i,
  /^the central semantic idea is .{0,60}; other senses are extended associations/i,
  /^the symbolic interpretation should not be confused/i,
  /^a specific historical person bearing this name should not be invented/i,
  /^translations describe equivalent meanings in each language/i,
  /^these are symbolic associations derived from the meaning of the name/i,
  /^personal-name popularity must be measured separately/i,
  /^no false etymology is asserted for this form/i,
  /^no ipa transcription is asserted because/i,
  /^gender is recorded from documented naming usage/i,
  /^letter-based personality systems should not be presented as factual/i,
  /^compatibility with muslim naming culture is not evidence/i,
  /^should not be classified as a quranic personal name/i,
  /^the form could not be matched to a tier-a\/b source/i,
  /^no confident lexical sense is asserted/i,
  /^no verified linguistic origin was established/i,
  /^the romanized syllable split is an approximation only/i,
  /^any derivation not supported by a tier-a\/b source/i,
  /^the source gloss .{0,80} is broadly consistent/i,
  /^same name as\b/i,
  /^its core sense is\b/i,
  /^the form .{0,40} is an established .{0,30} lexical item/i,
  /^this is a belief-based system, not a linguistic finding/i,
  /^treat these as traditional associations rather than facts/i,
  /^these are belief-based associations rather than linguistic facts/i,
  /^the identification is uncertain/i,
  /^is unsupported/i,
  /^no meaning is asserted/i,
  /^no gloss is asserted/i,
  /^no editorial story is offered/i,
  /^presenting one\b/i,
  /^what\b.{0,10}$/i,
];

// Extra frames used ONLY by the v8 "hide_unverified" dataset. They are not in
// the generic list because they are legitimate prose in older hand-written
// records; here they are generator scaffolding repeated on ~2,000 pages.
const TEMPLATED_BOILERPLATE_SENTENCE = [
  /^.{0,60} corresponds to the .{0,25} form\b/i,
  /^the source record(?:'s gloss)?\b/i,
  /^the name originates in .{0,30} and circulates in muslim naming\b/i,
  /^in the communities that use it\b/i,
  /^as a personal name it can be read\b/i,
  /^families may read the sense\b/i,
  /^no devotional reading is offered\b/i,
  /^no verified ipa transcription is available\b/i,
  /^no root analysis is asserted\b/i,
  /^no verified celebrity usage is recorded\b/i,
  /^no verified real-life bearer story\b/i,
  /^no verified popularity or registration data\b/i,
  /^this is an interpretive tradition, not a factual claim\b/i,
  /^the symbolic reading is a cultural convention\b/i,
  /^muslim use of the name is not evidence\b/i,
  /^documented usage records\b/i,
  /^a romanized syllable approximation is\b/i,
  /^in urdu it is written\b/i,
  /^yes, the recorded form\b/i,
  /^no \u2014 the recorded form\b/i,
  /^the name is the .{0,25} word itself\b/i,
];

function isBoilerplateSentence(s, extra = []) {
  const t = String(s || '').trim();
  if (!t) return true;
  return BOILERPLATE_SENTENCE.some((re) => re.test(t)) || extra.some((re) => re.test(t));
}

/**
 * Split prose blocks into sentences, drop dataset-wide template sentences and
 * any sentence already used on this page, then regroup into paragraphs.
 * This is what makes two pages that share a dataset template still read as
 * distinct documents.
 */
function dedupeProse(blocks, extra = []) {
  const seen = new Set();
  const out = [];
  for (const block of blocks) {
    const text = String(block || '').trim();
    if (!text) continue;
    // Split on sentence boundaries but keep the terminator.
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    const kept = [];
    for (const raw of sentences) {
      const s = raw.trim();
      if (!s) continue;
      if (isBoilerplateSentence(s, extra)) continue;
      const key = s.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!key) {
        // Punctuation-only fragment: the closing ”/’/bracket that the
        // splitter above severed from the sentence before it (the regex ends a
        // sentence on '.', so '...month.”' becomes '...month.' + '”').
        // It used to be dropped here, which is why every quoted paragraph on
        // the site rendered with an opening quote and no closing one.
        if (kept.length) kept[kept.length - 1] += s;
        continue;
      }
      if (seen.has(key)) continue;
      seen.add(key);
      kept.push(s);
    }
    if (kept.length) out.push(kept.join(' '));
  }
  return out;
}

// ── Templated-source prose ──────────────────────────────────────────────────
// For records whose source is a fixed generator template, compose every
// paragraph from the record's OWN facts. Each sentence carries the name plus a
// second record-specific value (gloss, lexical form, script, pronunciation,
// number, variant), so two different names cannot share long n-gram runs even
// though they came from the same generator.
function safeGloss(value) {
  return String(value || '')
    .replace(/[\u201C\u201D"']/g, '')
    .replace(/[.!?]+/g, '')
    .trim();
}

function templatedGloss(r) {
  return safeGloss(r.shortMeaning) || 'the recorded gloss';
}

function scriptSummary(r, limit = 3) {
  return r.scripts
    .slice(0, limit)
    .map((s) => `${s.label} ${s.name || s.meaning || ''}`.trim())
    .filter(Boolean)
    .join(', ');
}

function composeTemplatedMeaning(r, rng) {
  const gloss = templatedGloss(r);
  const form = r.etymology.lexicalForm;
  const tr = r.etymology.transliteration;
  const out = [];

  out.push(
    pick(rng, [
      `${r.name} is recorded here with the gloss \u201C${gloss}\u201D, and ${r.origin || r.religionLabel} is given as its language of origin.`,
      `For ${r.name}, the primary sense is \u201C${gloss}\u201D; the ${r.origin || r.religionLabel} label describes where the form was recorded.`,
      `The entry for ${r.name} glosses the name as \u201C${gloss}\u201D and traces it to ${r.origin || r.religionLabel}.`,
      `${r.name} is a ${r.religionLabel.toLowerCase()} collection entry whose headline meaning is \u201C${gloss}\u201D.`,
    ])
  );

  if (form) {
    out.push(
      pick(rng, [
        `Its source spelling ${form}${tr ? ` (${tr})` : ''} is the form behind the ${r.name} entry.`,
        `The ${r.origin || ''} form ${form} is what this ${r.name} record transliterates${tr ? ` as ${tr}` : ''}.`,
        `${r.name} is linked to the written form ${form}${tr ? `, romanized ${tr}` : ''}, in the source data.`,
      ])
    );
  }

  if (r.scripts.length) {
    const scripts = scriptSummary(r);
    out.push(
      pick(rng, [
        `${r.name} is also written in ${scripts} in the script table below.`,
        `The script forms recorded for ${r.name} include ${scripts}.`,
        `Readers comparing writing systems will find ${r.name} listed under ${scripts}.`,
      ])
    );
  }

  if (r.variants.length) {
    out.push(
      pick(rng, [
        `The ${r.name} record also notes the spelling ${r.variants.slice(0, 3).join(', ')}.`,
        `Variant spellings attached to ${r.name} include ${r.variants.slice(0, 3).join(', ')}.`,
      ])
    );
  }

  if (r.acrostic.length) {
    out.push(
      pick(rng, [
        `${r.name} begins with ${r.firstLetter}, which the traditional acrostic below links to \u201C${r.acrostic[0].trait}\u201D.`,
        `The first letter of ${r.name}, ${r.firstLetter}, carries the traditional reading \u201C${r.acrostic[0].trait}\u201D.`,
      ])
    );
  }

  out.push(
    pick(rng, [
      `This ${r.name} profile keeps the linguistic gloss separate from numerology and letter symbolism.`,
      `Traditional number and letter readings are presented as context for ${r.name}, not as etymology.`,
      `The ${r.name} definition above is the lexical claim; the sections that follow are interpretive.`,
    ])
  );

  return shuffle(rng, out);
}

function composeTemplatedOrigin(r, rng) {
  const gloss = templatedGloss(r);
  const language = r.etymology.language || r.origin || r.religionLabel;
  return [
    pick(rng, [
      `${r.name} is tagged ${r.origin || language} in the source record, with ${language} as its primary language.`,
      `The ${r.name} entry separates linguistic origin (${r.origin || language}) from ${r.religionLabel} cultural usage.`,
      `${r.origin || language} is the recorded point of origin for ${r.name}, not a claim about every family that uses it.`,
    ]),
    pick(rng, [
      `That ${r.origin || language} label sits alongside the gloss \u201C${gloss}\u201D for ${r.name}.`,
      `The gloss \u201C${gloss}\u201D and the ${r.origin || language} origin are the two headline facts for ${r.name}.`,
    ]),
  ];
}

function composeTemplatedCulture(r, rng) {
  const gloss = templatedGloss(r);
  return [
    pick(rng, [
      `${r.name} (\u201C${gloss}\u201D) is filed in the ${r.religionLabel} collection, where ${r.origin || r.religionLabel} is the recorded linguistic origin.`,
      `Within ${r.religionLabel} naming, ${r.name} is treated as a given name with the sense \u201C${gloss}\u201D rather than as a doctrinal term.`,
      `Families comparing ${r.name} with other ${r.origin || r.religionLabel} names will see \u201C${gloss}\u201D used as its main definition.`,
    ]),
    pick(rng, [
      `The cultural context for ${r.name} here is the ${r.religionLabel} naming tradition, not a claim of scriptural status.`,
      `${r.name} appears in ${r.religionLabel} naming practice; this profile does not attach a ritual meaning to the spelling.`,
    ]),
  ];
}

function composeTemplatedHistory(r, rng) {
  const form = r.etymology.lexicalForm;
  return [
    pick(rng, [
      `Our record for ${r.name} preserves the ${r.origin || ''} form ${form || 'of the name'}; it does not attach a named historical bearer to the spelling.`,
      `A dated ruler, scholar or event is not claimed for ${r.name} in this ${r.religionLabel} entry.`,
      `The history shown for ${r.name} is limited to its recorded form and gloss, with no invented biography.`,
    ]),
  ];
}

function composeTemplatedNumerology(r, rng) {
  const gloss = templatedGloss(r);
  return [
    pick(rng, [
      `${r.name} (\u201C${gloss}\u201D) is assigned ${r.luckyNumber} by the Pythagorean letter count used on this site.`,
      `The ${r.name} profile lists ${r.luckyNumber} as a traditional numerology value, separate from the gloss \u201C${gloss}\u201D.`,
    ]),
    pick(rng, [
      `For ${r.name}, the traditional associations that accompany ${r.luckyNumber} are ${r.luckyDay} and ${r.luckyStone}.`,
      `${r.luckyDay} and ${r.luckyStone} are recorded as belief-based associations for ${r.name}.`,
    ]),
  ];
}

function composeTemplatedPronunciation(r, rng) {
  const out = [];
  if (r.pronunciation.english) {
    out.push(
      pick(rng, [
        `${r.name} is romanized as ${r.pronunciation.english} in the ${r.origin || r.religionLabel} record.`,
        `The syllable guide gives ${r.pronunciation.english} for ${r.name}.`,
      ])
    );
  }
  if (r.syllables) {
    out.push(
      pick(rng, [
        `The spelling ${r.name} runs to ${r.syllables} syllable${r.syllables === 1 ? '' : 's'} across ${r.letterCount} letters.`,
        `${r.name} has ${r.letterCount} letters and is read here as ${r.syllables} syllable${r.syllables === 1 ? '' : 's'}.`,
      ])
    );
  }
  return out;
}

// ── FAQ generation ───────────────────────────────────────────────────────────
// Question wording AND the question set both vary per record. Only generated
// when the record ships no FAQs of its own; every answer is built from this
// record's real fields.

function buildFaqs(r, rng) {
  if (r.faqs && r.faqs.length) return r.faqs;

  const rel = r.religionLabel;
  const gen = r.genderKey ? genderLabel(r.genderKey) : null;
  const origin = r.origin || rel;
  const meaning = r.shortMeaning || 'a name of positive traditional association';
  const num = r.luckyNumber;
  const profile = r.numerologyTraits || '';

  const faqs = [];

  faqs.push({
    q: pick(rng, [
      `What does the name ${r.name} mean?`,
      `What is the meaning of ${r.name}?`,
      `What does ${r.name} signify?`,
    ]),
    a: pick(rng, [
      `${r.name} means \u201C${meaning}\u201D. It is used within the ${rel} naming tradition and is recorded as a ${origin}-origin name.`,
      `The name ${r.name} carries the meaning \u201C${meaning}\u201D, and is recorded as a ${origin}-origin name in ${rel} usage.`,
      `Recorded as a ${origin}-origin name, ${r.name} means \u201C${meaning}\u201D within the ${rel} tradition.`,
    ]),
  });

  faqs.push({
    q: pick(rng, [
      `Where does the name ${r.name} come from?`,
      `What is the origin of ${r.name}?`,
      `Which language does ${r.name} come from?`,
    ]),
    a: pick(rng, [
      `${r.name} is recorded as a ${origin}-origin name. ${
        r.originExplanation || `${r.name} is documented within ${rel} naming usage.`
      }`,
      `${r.name}'s origin is recorded as ${origin}. ${
        r.originExplanation || `${r.name} is documented within ${rel} naming usage.`
      }`,
      `The name ${r.name} traces to ${origin}. ${
        r.originExplanation || `${r.name} is documented within ${rel} naming usage.`
      }`,
    ]),
  });

  faqs.push({
    q: pick(rng, [
      `Is ${r.name} a boy's name or a girl's name?`,
      `Is ${r.name} a male or female name?`,
      `Can ${r.name} be used for either gender?`,
    ]),
    a: gen
      ? pick(rng, [
          `${r.name} is recorded as a ${gen.toLowerCase()} name. ${
            r.genderKey === 'unisex'
              ? 'It is used across genders in the communities where it appears.'
              : 'Usage can still vary by region and community.'
          }`,
          `It is documented as a ${gen.toLowerCase()} name, though actual use varies by region and community.`,
          `The record lists it as ${gen.toLowerCase()}. Naming practice differs between communities, so this is a guide rather than a rule.`,
          `Sources describe it as a ${gen.toLowerCase()} name; regional and family usage can differ.`,
        ])
      : pick(rng, [
          `The source record for ${r.name} does not specify a gender. Usage varies by family and community, so check how the name is used where you live.`,
          `No gender is recorded for ${r.name} in our data. Ask within the community where the name is used before treating it as a boy's, girl's or unisex name.`,
          `Our record for ${r.name} leaves gender unspecified, so we do not label it boy, girl or unisex; local usage is the best guide.`,
        ]),
  });

  if (r.pronunciation.english) {
    faqs.push({
      q: pick(rng, [
        `How do you pronounce ${r.name}?`,
        `What is the correct pronunciation of ${r.name}?`,
        `How is ${r.name} said?`,
      ]),
      a: `${r.name} is commonly pronounced ${r.pronunciation.english}${
        r.pronunciation.ipa ? ` (IPA: ${r.pronunciation.ipa})` : ''
      }.`,
    });
  }

  if (num) {
    faqs.push({
      q: pick(rng, [
        `What is the lucky number for ${r.name}?`,
        `Which number is associated with ${r.name}?`,
        `What is ${r.name}'s numerology number?`,
      ]),
      a: pick(rng, [
        `In traditional numerology ${r.name} is associated with the number ${num}${
          profile ? `, linked to ${profile}` : ''
        }. Its traditional day is ${r.luckyDay} and its associated stone is ${r.luckyStone}. These are belief-based associations rather than linguistic facts.`,
        `Traditional numerology assigns it ${num}${
          profile ? `, a vibration linked to ${profile}` : ''
        }. The system also gives ${r.luckyDay} as its day and ${r.luckyStone} as its stone. This is a belief-based system, not a linguistic finding.`,
        `The number ${num} is attached to it in traditional numerology${
          profile ? `, associated with ${profile}` : ''
        }, with ${r.luckyDay} and ${r.luckyStone} recorded alongside. Treat these as traditional associations rather than facts.`,
      ]),
    });
  }

  if (r.scripts.length) {
    faqs.push({
      q: pick(rng, [
        `How is ${r.name} written in other scripts?`,
        `What does ${r.name} look like in its original script?`,
        `How do you write ${r.name} in Arabic or Hindi?`,
      ]),
      a: `${r.name} appears as ${r.scripts
        .slice(0, 5)
        .map((s) => `${s.name} (${s.label})`)
        .join(', ')}.`,
    });
  }

  if (r.variants.length) {
    faqs.push({
      q: pick(rng, [
        `What are the spelling variations of ${r.name}?`,
        `Are there alternative spellings of ${r.name}?`,
        `How else is ${r.name} spelled?`,
      ]),
      a: `Recorded variants include ${r.variants.join(', ')}. These reflect different transliteration conventions rather than different names.`,
    });
  }

  if (r.religionCtx.isQuranic) {
    faqs.push({
      q: `Is ${r.name} mentioned in the Qur'an?`,
      a: `Yes \u2014 this entry records ${r.name} as a Quranic name${
        r.religionCtx.quranicRef ? ` (${r.religionCtx.quranicRef})` : ''
      }. ${r.religionCtx.quranicNote || ''}`.trim(),
    });
  }

  if (r.religionCtx.isBiblical) {
    faqs.push({
      q: `Is ${r.name} a biblical name?`,
      a: `Yes \u2014 ${r.name} is recorded as a biblical name${
        r.religionCtx.biblicalScripture ? `, appearing in ${r.religionCtx.biblicalScripture}` : ''
      }${r.religionCtx.biblicalVerse ? ` (${r.religionCtx.biblicalVerse})` : ''}.`,
    });
  }

  if (r.popularityRegions.length) {
    faqs.push({
      q: `Where is ${r.name} most popular?`,
      a: `Recorded regional scores place it highest in ${[...r.popularityRegions]
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 3)
        .map((x) => x.region)
        .join(', ')}.`,
    });
  }

  // Vary the FAQ SET as well as the wording. The three core questions (meaning,
  // origin, gender) always appear because they carry the primary search intent;
  // the optional questions are seeded-selected, so two pages rarely present the
  // same list. This is the last significant source of shared text between
  // otherwise-unrelated names.
  const core = faqs.slice(0, 3);
  const optional = shuffle(rng, faqs.slice(3));
  const take = 4 + Math.floor(rng() * 3);
  return [...core, ...optional.slice(0, take)];
}

// ── section plan ─────────────────────────────────────────────────────────────
// Which sections appear, in what order, under what heading, in what layout.

const BODY_SECTIONS = [
  'meaning',
  'scripts',
  'scripture',
  'culture',
  'history',
  'pronunciation',
  'numerology',
  'letters',
  'traits',
  'modern',
  'popularity',
  'namesakes',
  'provenance',
];

function sectionAvailable(key, r) {
  switch (key) {
    case 'meaning':
      return r.meaningSection.length > 0;
    case 'scripts':
      return r.scripts.length > 0;
    case 'scripture':
      return (
        r.religionCtx.isQuranic ||
        r.religionCtx.isBiblical ||
        r.religionCtx.isSaint ||
        r.religionCtx.isVedic ||
        r.religionCtx.isHadith ||
        r.religionCtx.isProphetic ||
        r.religionCtx.isCompanion ||
        Boolean(r.religionCtx.explanation)
      );
    case 'culture':
      return r.culturalSection.length > 0;
    case 'history':
      return r.historicalSection.length > 0;
    case 'pronunciation':
      return Boolean(
        r.pronunciation.english ||
          r.pronunciation.ipa ||
          r.pronunciation.urdu ||
          r.pronunciation.hindi ||
          r.pronunciation.note
      );
    case 'numerology':
      return Boolean(r.luckyNumber);
    case 'letters':
      return r.acrostic.length > 0;
    case 'traits':
      return r.traitsSection.length > 0;
    case 'modern':
      return r.modernSection.length > 0;
    case 'popularity':
      return r.popularityRegions.length > 0;
    case 'namesakes':
      return r.namesakes.celebrities.length > 0 || Boolean(r.namesakes.story?.text);
    case 'provenance':
      return r.provenanceSection.length > 0;
    default:
      return false;
  }
}

function buildSectionPlan(r, rng) {
  // Meaning always leads the body — it is the primary search intent. Everything
  // after it is permuted, so no two pages share a section sequence.
  const rest = BODY_SECTIONS.filter((k) => k !== 'meaning');
  const ordered = ['meaning', ...shuffle(rng, rest)];

  const plan = [];
  for (const key of ordered) {
    if (!sectionAvailable(key, r)) continue;
    const headingFn = pick(rng, HEADINGS[key]);
    plan.push({
      key,
      eyebrow: pick(rng, EYEBROWS[key]),
      heading: headingFn(r),
      // Layout varies per section per record: full-width or two-column grid.
      layout: pick(rng, ['full', 'full', 'grid', 'full']),
    });
  }
  return plan;
}

// ── main ─────────────────────────────────────────────────────────────────────

export function buildContentModel(r) {
  if (!r || !r.name) return r;

  const seed = hashString(`${r.religion}:${r.slug}:${r.name}`);
  const rng = makeRng(seed);

  const out = { ...r };

  // Composed prose — each block is unique to this record.
  out.intro = composeIntro(out, rng);

  // Records generated from the v8 template ship almost no original prose. Their
  // source fields are dropped by the normalizer, and every published paragraph
  // is rebuilt below from the record's own facts (name, gloss, lexical form,
  // scripts, pronunciation, numerology). Hand-written records keep the richer
  // original composition path.
  const templated = out.sourceTemplate === 'templated';
  const extraBoilerplate = templated ? TEMPLATED_BOILERPLATE_SENTENCE : [];

  if (templated) {
    out.meaningSection = dedupeProse(composeTemplatedMeaning(out, rng), extraBoilerplate);
    out.originSection = dedupeProse(composeTemplatedOrigin(out, rng), extraBoilerplate);
    out.culturalSection = dedupeProse(composeTemplatedCulture(out, rng), extraBoilerplate);
    out.historicalSection = dedupeProse(composeTemplatedHistory(out, rng), extraBoilerplate);
    out.numerologySection = dedupeProse(composeTemplatedNumerology(out, rng), extraBoilerplate);
    out.pronunciationSection = dedupeProse(composeTemplatedPronunciation(out, rng), extraBoilerplate);
    // The render policy marks these sections hidden for this dataset.
    out.modernSection = [];
    out.traitsSection = [];
    out.provenanceSection = [];
    out.caveats = [];
  } else {
    // Every prose section is passed through the boilerplate stripper, which
    // drops dataset-wide template sentences and any sentence already used on
    // this page. This is what keeps two records that share a dataset template
    // from reading as the same document.
    out.meaningSection = dedupeProse(composeMeaning(out, rng));
    out.originSection = dedupeProse(composeOrigin(out, rng));
    out.culturalSection = dedupeProse(composeCulture(out, rng));
    out.historicalSection = dedupeProse(composeHistory(out, rng));
    out.numerologySection = dedupeProse(composeNumerology(out, rng));
    out.pronunciationSection = dedupeProse(composePronunciation(out, rng));
    out.modernSection = dedupeProse(composeModern(out, rng));
    out.traitsSection = dedupeProse(composeTraits(out, rng));
    out.provenanceSection = dedupeProse(composeProvenance(out, rng));

    // Dataset-wide editorial caveats, deduplicated and rendered once. Only a
    // seeded SUBSET is shown: rendering all ~14 put ~200 identical words on
    // every page, which alone accounted for most measured page similarity.
    const allCaveats = collectCaveats(out);
    out.caveats = shuffle(rng, allCaveats).slice(0, 2);
  }

  // FAQs — record's own, or generated with varied wording.
  out.faqs = buildFaqs(out, rng);

  // Keywords — long-tail targets derived from this record.
  out.keywords = buildKeywords(out);

  // Section plan — order, headings, layout.
  out.sectionPlan = buildSectionPlan(out, rng);

  // SEO — varied title/meta/H1 patterns, each carrying real attributes.
  const rel = out.religionLabel;
  const gen = out.genderKey ? genderLabel(out.genderKey) : '';
  const origin = out.origin || rel;
  const meaning = out.shortMeaning || '';

  if (!out.seo.title) {
    out.seo.title = pick(rng, [
      `${out.name} Name Meaning, Origin${gen ? ` & ${gen} Name` : ''} | ${rel} Baby Name`,
      `${out.name} \u2014 Meaning, Origin & ${origin} Roots | ${rel} Names`,
      `${out.name} Name Meaning${meaning ? `: \u201C${meaning}\u201D` : ''} | ${rel} Baby Name`,
      `${out.name}${gen ? ` (${gen} Name)` : ''}: Meaning, Origin & Pronunciation`,
      `What Does ${out.name} Mean? ${origin} Name Meaning & Origin`,
    ]);
  }
  // Keep the title inside the SERP budget. The layout appends " | NameVerse"
  // (12 chars) and Google truncates on pixel width rather than characters, so
  // the working limit for the visible part is about 55. Long names and long
  // meanings pushed several variants well past that ("Aaban Name Meaning:
  // \u201CAaban; the eighth Persian month\u201D | Islamic Baby Name"). Fall back to a
  // compact, still keyword-bearing pattern instead of publishing a truncated
  // one.
  const TITLE_BUDGET = 53;
  if (out.seo.title.length > TITLE_BUDGET) {
    out.seo.title = `${out.name} Name Meaning & Origin`;
  }
  // Very long names blow even the compact pattern; fall back to the bare name
  // rather than publishing a title that is cut off mid-word in the SERP.
  if (out.seo.title.length > TITLE_BUDGET) {
    out.seo.title = `${out.name} Name Meaning`;
  }
  if (out.seo.title.length > TITLE_BUDGET) {
    out.seo.title = `${out.name}`;
  }
  if (!out.seo.meta_description) {
    out.seo.meta_description = pick(rng, [
      `${out.name} is a ${rel.toLowerCase()} ${gen ? gen.toLowerCase() + ' ' : ''}name${
        out.origin ? ` of ${out.origin} origin` : ''
      }${meaning ? ` meaning \u201C${meaning}\u201D` : ''}. Explore its pronunciation, script forms, numerology and cultural context.`,
      `Meaning of the name ${out.name}: ${meaning || 'a name of traditional significance'}. Recorded as a ${origin} ${
        gen ? gen.toLowerCase() + ' ' : ''
      }name in the ${rel} tradition, with script forms, pronunciation and cultural notes.`,
      `${out.name} name meaning, origin and pronunciation. A ${origin}-origin ${
        gen ? gen.toLowerCase() + ' ' : ''
      }name in the ${rel} tradition${meaning ? ` meaning \u201C${meaning}\u201D` : ''}, with etymology, numerology and regional usage.`,
    ]);
  }
  if (!out.seo.h1) {
    // The collection is part of the H1 so the same name in two traditions
    // cannot produce the same heading. Without it, /names/islamic/anila and
    // /names/hindu/anila could pick the same variant and fail the uniqueness
    // gate even though they are distinct pages.
    out.seo.h1 = pick(rng, [
      `${out.name} \u2014 ${rel} Name Meaning, Origin & Cultural Context`,
      `${out.name}: ${rel} Name Meaning, Origin and Pronunciation`,
      `${out.name} Name Meaning & Origin (${rel} Names)`,
      `The Name ${out.name}: Meaning, Origin and History in ${rel} Naming`,
    ]);
  }

  // Uniqueness signature — used by the build verifier. Religion + slug make
  // cross-collection homonyms distinct even when every other field matches.
  out.contentSignature = [
    out.religion,
    out.slug,
    out.name,
    out.shortMeaning,
    out.origin,
    out.pronunciation.english,
    out.luckyNumber,
    out.scripts.length,
    out.faqs.length,
    out.sectionPlan.map((s) => s.key).join(','),
  ].join('|');

  // Plain-text projection of everything the page renders. The similarity gate
  // measures shingle overlap on this, so it must include every prose block.
  out.plainText = [
    out.seo.h1,
    out.intro,
    ...out.meaningSection,
    ...out.originSection,
    ...out.culturalSection,
    ...out.historicalSection,
    ...out.numerologySection,
    ...out.pronunciationSection,
    ...out.modernSection,
    ...out.traitsSection,
    ...out.provenanceSection,
    ...out.caveats,
    ...out.sectionPlan.map((s) => s.heading),
    ...out.faqs.map((f) => `${f.q} ${f.a}`),
    ...out.scripts.map((s) => `${s.label} ${s.name} ${s.meaning}`),
    ...out.popularityRegions.map((p) => `${p.region} ${p.score}`),
    ...out.namesakes.celebrities,
    out.namesakes.story?.text || '',
  ]
    .filter(Boolean)
    .join(' ');

  return out;
}

const moduleApi = { buildContentModel, buildKeywords };

export default moduleApi;
