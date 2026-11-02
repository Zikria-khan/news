'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const RELIGIONS = ['islamic', 'christian', 'hindu'];
const RELIGION_LABELS = {
  islamic: 'Islamic',
  christian: 'Christian',
  hindu: 'Hindu',
};

// Starter suggestions for the empty search box. These are examples, not a
// ranking — nothing here claims a name is "trending".
const STARTER_SUGGESTIONS = [
  { term: 'Aarav', tag: 'Hindu boy name' },
  { term: 'Aaban', tag: 'Islamic boy name' },
  { term: 'Ayla', tag: 'Meaning Moon / Light' },
  { term: 'Noah', tag: 'Biblical Classic' },
  { term: 'Zayn', tag: 'Meaning Beauty & Grace' },
  { term: 'Sofia', tag: 'Meaning Wisdom' },
];

function normalizeGender(gender) {
  const g = String(gender || '').toLowerCase().trim();
  if (!g) return null;
  const isFemale = /female|girl|feminine/.test(g);
  const isMale = /(^|[^e])male|\bboy|masculin/.test(g);
  if (isMale && isFemale) return 'unisex';
  if (isFemale) return 'girl';
  if (isMale) return 'boy';
  return 'unisex';
}

export default function HomepageSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, islamic, christian, hindu, boy, girl
  const [allNames, setAllNames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Lazy load search index when user focuses or types
  const loadIndex = () => {
    if (allNames.length > 0 || isLoading) return;
    setIsLoading(true);
    Promise.all(
      RELIGIONS.map((r) =>
        fetch(`/names/${r}/_search-index.json`)
          .then((res) => (res.ok ? res.json() : []))
          .then((items) =>
            items.map((item) => ({
              ...item,
              religion: r,
              normalizedGender: normalizeGender(item.g),
            }))
          )
          .catch(() => [])
      )
    )
      .then((arrays) => {
        setAllNames(arrays.flat());
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter & score results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || allNames.length === 0) return [];

    let filtered = allNames.filter((item) => {
      // Filter check
      if (activeFilter !== 'all') {
        if (activeFilter === 'boy' && item.normalizedGender !== 'boy') return false;
        if (activeFilter === 'girl' && item.normalizedGender !== 'girl') return false;
        if (RELIGIONS.includes(activeFilter) && item.religion !== activeFilter) return false;
      }

      const name = (item.n || '').toLowerCase();
      const meaning = (item.m || '').toLowerCase();
      const origin = (item.o || '').toLowerCase();

      return name.includes(q) || meaning.includes(q) || origin.includes(q);
    });

    // Score & sort: exact name match > startsWith name > contains name > meaning match
    filtered.sort((a, b) => {
      const aName = (a.n || '').toLowerCase();
      const bName = (b.n || '').toLowerCase();

      if (aName === q && bName !== q) return -1;
      if (bName === q && aName !== q) return 1;

      const aStarts = aName.startsWith(q);
      const bStarts = bName.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (bStarts && !aStarts) return 1;

      return (b.p || 0) - (a.p || 0);
    });

    return filtered.slice(0, 8);
  }, [query, allNames, activeFilter]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault();
        const item = results[selectedIndex];
        router.push(`/names/${item.religion}/${item.s}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      let url = `/search?q=${encodeURIComponent(query.trim())}`;
      if (activeFilter !== 'all') {
        if (RELIGIONS.includes(activeFilter)) url += `&religion=${activeFilter}`;
        if (activeFilter === 'boy' || activeFilter === 'girl') url += `&gender=${activeFilter}`;
      }
      router.push(url);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative mx-auto mt-8 max-w-2xl text-left">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative z-30">
        <div className="relative flex items-center rounded-2xl border border-nv-border bg-nv-surface/95 p-2 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition hover:border-nv-accent/40 focus-within:border-nv-accent focus-within:ring-4 focus-within:ring-nv-accent/10">
          <div className="grid h-10 w-10 shrink-0 place-items-center text-nv-text-muted pl-1">
            {isLoading ? (
              <svg className="h-5 w-5 animate-spin text-nv-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => {
              loadIndex();
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a baby name, meaning or origin… (e.g. light, Aarav, peace, Zain)"
            aria-label="Search baby names instantly"
            autoComplete="off"
            className="w-full bg-transparent px-3 py-2 text-base text-nv-text placeholder-nv-text-muted focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              className="mr-2 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-nv-text-muted hover:bg-nv-subtle hover:text-nv-text"
              aria-label="Clear search"
            >
              &times;
            </button>
          )}

          <button type="submit" className="btn-primary shrink-0 !min-h-[44px] !px-6 text-sm">
            Search
          </button>
        </div>
      </form>

      {/* Filter Chips Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 px-2 text-xs">
        <span className="text-[11px] font-semibold text-nv-text-muted mr-1">Quick filter:</span>
        {[
          { id: 'all', label: 'All' },
          { id: 'islamic', label: 'Islamic' },
          { id: 'christian', label: 'Christian' },
          { id: 'hindu', label: 'Hindu' },
          { id: 'boy', label: 'Boys ♂' },
          { id: 'girl', label: 'Girls ♀' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setActiveFilter(f.id);
              loadIndex();
            }}
            className={`rounded-full px-2.5 py-1 font-medium transition ${
              activeFilter === f.id
                ? 'bg-nv-accent text-white shadow-sm'
                : 'border border-nv-border bg-nv-surface/80 text-nv-text-secondary hover:border-nv-accent/40 hover:text-nv-text'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-nv-border bg-nv-surface/98 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          {query.trim().length === 0 ? (
            /* Blank state: starter suggestions */
            <div className="p-4">
              <div className="mb-2.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-nv-text-muted">
                <span>Try one of these</span>
                <span className="text-[11px] font-normal normal-case">Type to auto-search</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {STARTER_SUGGESTIONS.map((item) => (
                  <button
                    key={item.term}
                    type="button"
                    onClick={() => {
                      setQuery(item.term);
                      inputRef.current?.focus();
                    }}
                    className="flex flex-col rounded-xl border border-nv-border/70 bg-nv-subtle/50 p-2.5 text-left transition hover:border-nv-accent/50 hover:bg-nv-accent-subtle"
                  >
                    <span className="font-display text-sm font-bold text-nv-text">{item.term}</span>
                    <span className="text-[11px] text-nv-text-secondary">{item.tag}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            /* Live matching results */
            <div>
              <div className="border-b border-nv-border/60 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-nv-text-muted flex justify-between items-center bg-nv-subtle/40">
                <span>Instant Suggestions ({results.length})</span>
                <span>Use &uarr;&darr; to navigate, Enter to view</span>
              </div>
              <ul className="divide-y divide-nv-border/40 max-h-[380px] overflow-y-auto">
                {results.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <li key={`${item.religion}-${item.s}`}>
                      <Link
                        href={`/names/${item.religion}/${item.s}`}
                        onClick={() => setIsOpen(false)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`flex items-center justify-between gap-3 px-4 py-3 transition ${
                          isSelected ? 'bg-nv-accent-subtle/70 text-nv-accent' : 'hover:bg-nv-subtle/50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-base font-bold text-nv-text">
                              {item.n}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                item.religion === 'islamic'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : item.religion === 'christian'
                                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                  : item.religion === 'hindu'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {RELIGION_LABELS[item.religion] || item.religion}
                            </span>
                            {item.normalizedGender && (
                              <span className="text-[11px] text-nv-text-muted">
                                {item.normalizedGender === 'boy' ? '♂ Boy' : item.normalizedGender === 'girl' ? '♀ Girl' : 'Unisex'}
                              </span>
                            )}
                          </div>
                          {item.m && (
                            <p className="mt-0.5 truncate text-xs text-nv-text-secondary">
                              {item.m}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right text-xs font-semibold text-nv-accent flex items-center gap-1">
                          <span>View</span>
                          <span>&rarr;</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-nv-border/70 bg-nv-subtle/60 p-2.5 text-center">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="text-xs font-bold text-nv-accent hover:underline"
                >
                  View all results for &ldquo;{query}&rdquo; &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* No results state */
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-nv-text">
                No names matching &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-nv-text-secondary">
                Try searching by meaning (e.g. &ldquo;light&rdquo;, &ldquo;peace&rdquo;), origin, or check spelling.
              </p>
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="btn-primary mt-3 !min-h-[36px] !px-4 text-xs"
              >
                Search Full 11,730 Database &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
