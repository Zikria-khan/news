# NameVerse on Netlify — low-credit configuration

Goal: **zero serverless invocations, zero edge invocations, minimal bandwidth.**
Every one of the ~12,600 pages is prerendered HTML served from Netlify's CDN.
The only things Netlify bills for are build minutes and bandwidth.

---

## What it costs at request time

| | |
|---|---|
| HTML pages | static, served from the CDN edge — no compute |
| `_next/static/*` | immutable, cached 1 year |
| sitemaps | static, cached 30 days |
| `_search-index.json` | static, 1 day browser / 30 days CDN + SWR |
| **Functions** | **none** |
| **Edge middleware** | **none** |

`npm run postbuild` runs `scripts/verify-static.mjs`, which **fails the build** if a dynamic route ever reappears. That is the guard against the failure mode that got the site paused.

---

## What changed

### `netlify.toml` (new)
Build config, caching headers, security headers, and the two trivial redirects.

- `NODE_VERSION = 22` (required by `@netlify/plugin-nextjs`), `NEXT_TELEMETRY_DISABLED = 1` (no telemetry writes or network calls during the build)
- `NEXT_BUILD_CPUS = 4` — each worker loads the 2.4 MB manifest, so uncapped workers multiply memory and can OOM
- Content verifiers run on every deploy via `prebuild` (no skip flag is set)
- `[[plugins]] package = "@netlify/plugin-nextjs"` — the official runtime; it sets `publish` itself, so `netlify.toml` deliberately has no `publish` key

### `middleware.js` — deleted
It 301'd non-canonical hosts to `nameverse.site`. On Netlify that runs as an **Edge Function on every single request**, which is exactly the cost class we're trying to eliminate.

Netlify does this natively and for free: set `nameverse.site` as the **primary domain** in *Site configuration → Domain management*. Netlify then 301s every other assigned domain (including `*.netlify.app`) to it at the edge, before any code runs.

**Do this or `www.nameverse.site` will serve as a separate site.**

### `vercel.json` — deleted
Dead config on Netlify. Its caching headers have been moved into `netlify.toml`, where they actually apply.

### `scripts/prune-build-assets.mjs` (new) — the big deploy-size win
`public/names/**` is **217 MB** across 13,805 JSON files. Every one is read at *build* time to prerender the pages — and then is completely unused at *request* time. Netlify publishes `public/` as static assets, so every deploy was uploading 217 MB that nobody would ever fetch.

This script deletes them from the publish payload **after** the HTML has been generated, keeping only the four `_search-index.json` files (which the client search components do fetch).

**Deploy payload: 217 MB → ~19 KB.**

Safety:
- refuses to run unless `NETLIFY=true`, so a local `npm run build` can never destroy the dataset
- refuses to run unless `.next/prerender-manifest.json` exists, so it can't delete the dataset after a failed build
- the dataset stays in git — only the deployed payload is trimmed

### Verifiers
`verify-content.mjs` and `verify-uniqueness.mjs` cost ~0.8 s and ~17 s per build and gate every production deploy through `prebuild`. `verify-static.mjs` runs after `next build` and is never skipped. All three also run locally with `npm run verify` / `npm run build`. `SKIP_CONTENT_VERIFIERS=1` is an emergency local-only escape hatch; it is deliberately not set in `netlify.toml`.

### `public/nameverse_logo_emblem.png` — deleted
223 KB, referenced nowhere. The 18 KB `.webp` is what the code uses.

---

## Build command

```toml
command = "npm run build && npm run prune"
```

`prebuild` → `next build` → `postbuild` (static gate) → `prune`. The prune must come last: the HTML is generated from the dataset, so the dataset can only be removed after the build finishes.

---

## The one thing that is still big

The prerendered HTML is **1,299 MB** across 12,611 pages — **105 KB per page**, of which roughly half is inlined RSC flight data (Next.js serialises the React tree into each page so client-side navigation works). That is inherent to the Next.js App Router; there is no switch to turn it off.

Consequences: deploys are large, and a full crawl of every page is ~1.3 GB of bandwidth. Netlify's free tier allows 100 GB/month, so a complete crawl costs about 1.3% of the quota — fine. Deploy *time* is the part you'll notice.

If deploy size ever becomes the binding constraint, the levers are, in order:

1. **Reduce page weight.** The page template is heavy — letters, numerology, world scripts, FAQs. Trimming it cuts every page at once.
2. **Reduce page count.** Fewer prerendered pages, fewer bytes.
3. **Change framework.** A static-site generator that ships plain HTML without an RSC payload produces ~10–15 KB per page instead of 105 KB — roughly **1.3 GB → 180 MB**. Note this project previously *was* an Astro site (`src/lib/data/astro-data.mjs` is still lying around), so that path has been walked before. Not a suggestion to act on now — just where the ceiling is.

---

## Redirects: why they live where they do

| Redirect | Where | Why |
|---|---|---|
| `/names/islamic/c` → `/names/islamic/letter/c` | `next.config.js` | Netlify placeholders can't be regex-constrained. A Netlify rule `/names/:religion/:letter` would match **every name page** and break all 12,600 of them. `next.config.js` uses path-to-regexp (`([a-z]|%23)`) so it matches exactly, and the Essential Next.js plugin honours it. |
| `/home`, `/homepage` → `/` | `netlify.toml` | Simple, no regex needed, cheaper at the edge. |
| `www.*`, `*.netlify.app` → `nameverse.site` | Netlify **primary domain** setting | Free, at the edge, before any code runs. |

---

## Setup checklist

1. Connect the repo to Netlify. `netlify.toml` is picked up automatically.
2. **Set `nameverse.site` as the primary domain** (*Site configuration → Domain management*). This replaces the deleted `middleware.js`.
3. Confirm nothing else got assigned as primary.
4. Deploy. The static-output gate will fail the build if anything regressed to dynamic rendering.
5. After the first deploy, check the deploy log for the `prune:` line — it should report ~13,800 files and ~217 MB removed.
