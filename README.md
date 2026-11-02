# NameVerse

**[nameverse.site](https://nameverse.site)** — a baby-name reference with meanings, origins and cultural context
across Islamic, Christian and Hindu traditions: 11,730 published name profiles, US ranking pages built on dated
Social Security Administration data, and in-depth naming guides.

Founded and run by **Zakriya Khan** — WhatsApp [0349 7174815](https://wa.me/923497174815) ·
[coding4443@gmail.com](mailto:coding4443@gmail.com).

---

## Stack

- **Next.js 15 (App Router)**, React 18, Tailwind CSS 3, self-hosted Fraunces + Inter fonts
- **Fully static output.** Every route is prerendered at build time (`dynamicParams = false`); there are no
  serverless functions or middleware at request time. `scripts/verify-static.mjs` fails the build if a dynamic route
  ever appears.
- **Hosting:** Netlify with `@netlify/plugin-nextjs` (see [`netlify.toml`](netlify.toml) and [`NETLIFY.md`](NETLIFY.md)).

## Getting started

```bash
npm ci
npm run dev          # http://localhost:3000
npm run build        # prebuild gates + next build + static-output gate (~13,900 pages, takes a while)
npm test             # lint + content verifiers (no build needed)
```

Requires Node 20+. A full build needs roughly 1.5 GB of memory for the Node process.

## Where things live

| Path | What it is |
| --- | --- |
| `public/names/<tradition>/*.json` | Source name records (≈13,800 files, 217 MB). The build reads them; `npm run prune` drops them from the deploy payload afterwards. |
| `src/lib/data/names-manifest.json` | Generated index of every record (`scripts/generate-manifest.mjs`). Decides `indexable` once, for the sitemap, pages and gates. |
| `public/data/blog-posts.json` | **All blog articles.** Each post has an id (its URL slug), dates, `sourceKeys`, and `content` (introduction, key takeaways, sections with paragraphs / bullets / name tables, FAQs). |
| `public/blog/og/<id>.png` | 1200×630 share card per article (generated, committed). |
| `lib/data/editorial.js` | Founder details, author byline, methodology, the dated ranking metadata (`RANKING_DATA`) and every citable source (`SOURCES`). |
| `lib/data/us-names.js` | Dated ranking data (SSA births in 2025, SSA risers, state tables, BabyCenter 2026 snapshot), curated lists and the name resolvers. |
| `lib/data/blog.js` | Blog helpers: computed read time, paragraphs, anchors, related posts, share-image lookup. |
| `lib/seo.js` | `pageMetadata()` — every route's canonical, Open Graph and Twitter metadata. |
| `lib/shortlist.js` | The on-device saved-names shortlist (localStorage only). |
| `app/sitemap.xml`, `app/sitemap/[id]` | Sitemap index and child sitemaps: `pages`, `blog` (with per-post `<lastmod>`), and one per tradition. |

## Writing or editing a blog post

1. Add or edit an entry in `public/data/blog-posts.json`. Keep `id` stable once published (it is the URL).
2. Cite sources with `sourceKeys` that exist in `SOURCES` (`lib/data/editorial.js`); add a new source there if needed.
3. Put statistics only with a named, dated source (for example "No. 4 for US babies born in 2025 (SSA)"). Label
   debated etymologies as debated.
4. Set `publishDate` / `lastUpdated` to the real dates; update `readTime` to match (the gate tells you the value).
5. Regenerate share cards: `pip install pillow fonttools brotli && python3 scripts/generate-share-images.py`.
6. Run `node scripts/verify-blog.mjs`. The new post appears in `/blog`, `/blog/<id>` and `/sitemap/blog.xml`
   automatically.

## Quality gates

| Script | When | What it checks |
| --- | --- | --- |
| `verify-blog.mjs` | prebuild | Sources exist, dates are real and not in the future, read times match content, excerpts fit snippets, no unsupported trend phrasing. |
| `verify-content.mjs` | prebuild | Samples 1,500 records for meaning/origin/FAQ/script coverage. |
| `verify-uniqueness.mjs` | prebuild | Samples 1,200 records for near-duplicate text (5-word shingles, Jaccard). |
| `verify-static.mjs` | postbuild | No dynamic routes; every indexable record prerendered; sitemap URLs unique and backed by real pages. |
| `verify-us-pages.mjs` | manual (`npm run verify:pages`) | Heading structure, JSON-LD, E-E-A-T block, self-canonical and internal links on the US pages. |

All prebuild gates run on Netlify too (`SKIP_CONTENT_VERIFIERS` is no longer set), because the editorial policy tells
readers they gate every deployment.

## Editorial rules the code enforces

- Rankings are always labelled with their population and period. The newest official US data is **SSA, babies born in
  2025, released May 8, 2026**; BabyCenter's table is an **in-progress, self-reported 2026 snapshot**.
- The internal `popularity_score` carried by some records is never presented as popularity, a ranking or a trend
  (Islamic records do not carry it at all).
- An unrecorded gender is shown as "not recorded", never "unisex". Origins are filed only under the origin they name.
- Profiles show a site-wide *methodology* date, not a per-profile review date, until per-record review data exists.

## Known data gaps

The source dataset is alphabetically incomplete for two traditions: Christian records cover names beginning **A–J**
and Hindu mostly **A–P**. Islamic records now cover **A–Z** (synced from the `new` repo's
`upgrading/names_upgraded/islamic/`). Names without a profile, and records held back as verification-pending or
consolidated as duplicates, are not linked: articles and
lists show such names as plain text rather than linking to a missing page.

## Historical documents

`MIGRATION-INDEXING-DIAGNOSIS.md`, `SEO-CONTENT-AUDIT.md` and `SEO-REMEDIATION-AND-CACHE-FIX.md` are point-in-time
reports. Counts and findings in them describe the site when they were written and may no longer be current.
