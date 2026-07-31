'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';

interface NewsItem {
  id: string;
  headline: string;
  source: string;
  url: string;
  summary?: string;
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  publishedAt: string;
  imageUrl?: string;
  relatedSymbols?: string[];
}

const CATEGORIES = ['All', 'General', 'Forex', 'Crypto', 'Merger', 'Earnings'];
const SENTIMENT_COLORS = { POSITIVE: 'text-success bg-success/10', NEGATIVE: 'text-danger bg-danger/10', NEUTRAL: 'text-[var(--text-muted)] bg-[var(--bg-hover)]' };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('All');
  const [searchQ, setSearchQ] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadNews = async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 0 : page;
    if (reset) setPage(0);
    try {
      const params = new URLSearchParams({ page: String(currentPage), size: '20' });
      if (category !== 'All') params.set('category', category.toLowerCase());
      if (searchQ.trim()) params.set('q', searchQ.trim());
      const data = await apiGet<{ content: NewsItem[]; last: boolean }>(`/news?${params}`);
      setNews((prev) => reset ? data.content : [...prev, ...data.content]);
      setHasMore(!data.last);
      if (!reset) setPage((p) => p + 1);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { loadNews(true); }, [category]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Market News</h1>
        {/* Search */}
        <div className="relative w-72">
          <input id="news-search-input" type="text" className="input pl-9 text-sm" placeholder="Search news…"
            value={searchQ} onChange={(e) => setSearchQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadNews(true)} />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((c) => (
          <button key={c} id={`news-cat-${c.toLowerCase()}`} onClick={() => setCategory(c)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              category === c ? 'bg-brand-500 text-white' : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-brand-500/40'
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* News grid */}
      {loading && news.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-[var(--bg-card)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {news.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                className="card p-5 flex flex-col gap-3 hover:border-brand-500/40 hover:shadow-lg transition-all duration-200 group">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--text-muted)]">{item.source}</span>
                  <div className="flex items-center gap-2">
                    {item.sentiment && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SENTIMENT_COLORS[item.sentiment]}`}>
                        {item.sentiment}
                      </span>
                    )}
                    <span className="text-xs text-[var(--text-muted)]">{timeAgo(item.publishedAt)}</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-3 group-hover:text-brand-400 transition-colors">
                  {item.headline}
                </h3>
                {item.summary && (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">{item.summary}</p>
                )}
                {item.relatedSymbols && item.relatedSymbols.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {item.relatedSymbols.slice(0, 4).map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-medium">{s}</span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>

          {news.length === 0 && (
            <div className="card p-12 text-center text-[var(--text-muted)] text-sm">
              No news found. Try a different category or search term.
            </div>
          )}

          {hasMore && (
            <div className="text-center">
              <button id="news-load-more-btn" onClick={() => loadNews()} disabled={loading}
                className="btn-secondary px-8">
                {loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
