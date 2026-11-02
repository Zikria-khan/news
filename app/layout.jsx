import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './globals.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import AdScripts from '../components/AdScripts.jsx';
import { FOUNDER } from '../lib/data/editorial.js';
import { DEFAULT_SHARE_IMAGE } from '../lib/seo.js';

const siteUrl = 'https://nameverse.site';
const siteName = 'NameVerse';
const siteLogo = `${siteUrl}/nameverse_logo_emblem.webp`;

// ─────────────────────────────────────────────────────────────────────────────
// ROOT METADATA — site-wide DEFAULTS ONLY.
//
// Next.js merges metadata shallowly: any page that does not define its own
// `openGraph`, `twitter` or `alternates` inherits these objects wholesale.
// This block used to carry the homepage's canonical, og:url, og:title and
// og:description, so ~25 pages (search, about, blog, tradition hubs …)
// declared the HOMEPAGE as their share target, and noindex utility pages
// inherited a canonical pointing at the homepage. The root now carries only
// values that are true for every page; each route sets its own canonical and
// social metadata through lib/seo.js#pageMetadata.
//
// The @NameVerseOfficial twitter:site/creator handle was removed: it could not
// be verified as an account the site controls, and claiming an unowned handle
// attributes our pages to whoever holds it.
// ─────────────────────────────────────────────────────────────────────────────
export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | NameVerse',
    default: 'Baby Names with Meanings, Origins & Cultural Context | NameVerse',
  },
  description:
    'Search 11,730 baby names with meanings, origins, pronunciation guides, script forms and cultural context across Islamic, Christian and Hindu traditions.',
  keywords: [
    'baby names',
    'baby name meanings',
    'name origin',
    'Islamic baby names',
    'Christian baby names',
    'Hindu baby names',
    'baby name finder',
    'names by meaning',
  ],
  openGraph: {
    siteName,
    images: [DEFAULT_SHARE_IMAGE],
    locale: 'en_US',
    type: 'website',
  },
  applicationName: siteName,
  authors: [{ name: FOUNDER.name, url: `${siteUrl}/about` }],
  creator: FOUNDER.name,
  publisher: siteName,
  category: 'Parenting',
  twitter: {
    // summary_large_image everywhere: a shared name page is a visual share.
    card: 'summary_large_image',
    images: [DEFAULT_SHARE_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  verification: {
    google: 'fB60sPZ-K1f5t10x-57z6f6_n655',
  },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: siteLogo,
        width: 512,
        height: 512,
      },
      founder: {
        '@type': 'Person',
        '@id': `${siteUrl}/about#founder`,
        name: FOUNDER.name,
        url: `${siteUrl}/about`,
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: FOUNDER.email,
          telephone: FOUNDER.telephone,
        },
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'hello@nameverse.site',
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
      publisher: { '@id': `${siteUrl}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#1E2A4A" />
        <meta
          name="google-site-verification"
          content="bY09F9IpVk_dzOagZu5xAzZwH9U-Io3IeuBeaBkfG0g"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{const t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-nv-page text-nv-text antialiased">
        <Navbar />
        {/* pb-mobile-cta reserves space for the sticky mobile tab bar so it
            never overlaps the footer or the last content block. */}
        <main className="flex-1 pb-mobile-cta">{children}</main>
        <Footer />
        {/* Every Adsterra script, rendered once for the whole site. Plain
            <script async> tags so they are present in the prerendered HTML and
            never block parsing or paint. Client-side only — zero server CPU. */}
        <AdScripts />
      </body>
    </html>
  );
}
