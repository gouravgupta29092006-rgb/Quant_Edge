'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';

interface NewsItem {
  id: string; headline: string; source: string; url: string;
  summary?: string; sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  publishedAt: string; imageUrl?: string; relatedSymbols?: string[];
}

const CATEGORIES = ['All', 'General', 'Forex', 'Crypto', 'Merger', 'Earnings'];

const SENTIMENT_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  POSITIVE: { bg: 'rgba(0,211,149,0.1)',  color: '#00D395', border: 'rgba(0,211,149,0.2)' },
  NEGATIVE: { bg: 'rgba(255,68,102,0.1)', color: '#FF4466', border: 'rgba(255,68,102,0.2)' },
  NEUTRAL:  { bg: 'rgba(78,90,122,0.1)',  color: '#8896B3', border: 'rgba(78,90,122,0.2)' },
};

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
      const params = new URLSearchParams({ page: String(currentPage), size: '21' });
      if (category !== 'All') params.set('category', category.toLowerCase());
      if (searchQ.trim()) params.set('q', searchQ.trim());
      const data = await apiGet<{ content: NewsItem[]; last: boolean }>(`/news?${params}`);
      setNews(prev => reset ? data.content : [...prev, ...data.content]);
      setHasMore(!data.last);
      if (!reset) setPage(p => p + 1);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadNews(true); }, [category]);

  return (
    <div className="page-wrapper">
      {/* Search + controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <input id="news-search-input" type="text" className="input pl-10 text-sm" placeholder="Search news…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadNews(true)} />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#4E5A7A" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} id={`news-cat-${c.toLowerCase()}`} onClick={() => setCategory(c)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
              style={{
                background: category === c ? 'rgba(99,102,241,0.15)' : 'rgba(24,28,46,0.5)',
                border: category === c ? '1px solid rgba(99,102,241,0.35)' : '1px solid #161C2E',
                color: category === c ? '#818CF8' : '#4E5A7A',
              }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Skeletons */}
      {loading && news.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      )}

      {/* News grid */}
      {news.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {news.map(item => {
            const sentStyle = item.sentiment ? SENTIMENT_STYLE[item.sentiment] : null;
            return (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                className="card flex flex-col gap-3 transition-all duration-200 group !p-5 relative overflow-hidden"
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#161C2E'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold" style={{ color: '#4E5A7A' }}>{item.source}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.sentiment && sentStyle && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: sentStyle.bg, color: sentStyle.color, border: `1px solid ${sentStyle.border}` }}>
                        {item.sentiment}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: '#2D3A5E' }}>{timeAgo(item.publishedAt)}</span>
                  </div>
                </div>

                {/* Headline */}
                <h3 className="text-sm font-bold leading-snug line-clamp-3 transition-colors duration-150"
                  style={{ color: '#F0F4FF', fontFamily: 'Outfit, sans-serif' }}>
                  {item.headline}
                </h3>

                {/* Summary */}
                {item.summary && (
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#8896B3' }}>
                    {item.summary}
                  </p>
                )}

                {/* Symbol tags */}
                {item.relatedSymbols && item.relatedSymbols.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                    {item.relatedSymbols.slice(0, 4).map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-md font-bold font-mono"
                        style={{ background: 'rgba(99,102,241,0.08)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.15)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hover arrow */}
                <div className="absolute top-4 right-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {!loading && news.length === 0 && (
        <div className="card p-12 text-center space-y-2">
          <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="#2D3A5E" strokeWidth={1.25}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-sm" style={{ color: '#4E5A7A' }}>No news found for this filter</p>
        </div>
      )}

      {hasMore && (
        <div className="text-center">
          <button id="news-load-more-btn" onClick={() => loadNews()} disabled={loading} className="btn-secondary px-8">
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
