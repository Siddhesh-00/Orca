import React, { useState, useRef, useEffect } from 'react';
import { geocode, GeoResult } from '../../services/geocoder';

interface LocationSearchProps {
  onSelect: (result: GeoResult) => void;
  placeholder?: string;
}

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const LoadingDot = () => (
  <div style={{ display: 'flex', gap: 3 }}>
    {[0,1,2].map(i => (
      <span key={i} className="typing-dot" style={{ animationDelay: i * 0.15 + 's' }} />
    ))}
  </div>
);

export const LocationSearch: React.FC<LocationSearchProps> = ({ onSelect, placeholder = 'Search location...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = (q: string) => {
    if (q.length < 3) { setResults([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await geocode(q);
        setResults(result ? [result] : []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        backgroundColor: 'rgba(10,22,40,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'border-color 0.15s',
      }}>
        <span style={{ color: 'var(--orca-text-muted)', display: 'flex', flexShrink: 0 }}>
          {loading ? <LoadingDot /> : <SearchIcon />}
        </span>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); search(e.target.value); }}
          onFocus={() => query.length >= 3 && setOpen(true)}
          placeholder={placeholder}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--orca-text-primary)',
            fontSize: 12,
            width: '100%',
            fontFamily: 'system-ui, sans-serif',
          }}
        />
      </div>

      {open && results.length > 0 && (
        <div
          className="anim-slide-up"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 2,
            backgroundColor: 'var(--orca-bg-tertiary)',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 50,
            maxHeight: 180,
            overflowY: 'auto',
          }}
        >
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => { onSelect(r); setQuery(r.shortName); setOpen(false); }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(45,212,191,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ fontSize: 12, color: 'var(--orca-text-primary)' }}>{r.shortName}</div>
              <div style={{ fontSize: 10, color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace', marginTop: 2 }}>
                {r.lat.toFixed(3)}, {r.lon.toFixed(3)} · {r.type}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
