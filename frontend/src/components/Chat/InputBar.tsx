import React, { useState, useRef, useEffect, useCallback } from 'react';

interface InputBarProps {
  onSendMessage: (msg: string) => void;
  isStreaming: boolean;
  attachedLocation?: { lat: number; lon: number };
  onAttachLocation?: (loc: { lat: number; lon: number } | undefined) => void;
  placeholder?: string;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const PinIcon = ({ active }: { active?: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={active ? 'var(--orca-accent)' : 'none'} stroke={active ? 'var(--orca-accent)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const StopIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <rect x="4" y="4" width="16" height="16" rx="1" />
  </svg>
);

const GpsIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </svg>
);

// ── Suggestion chips ──────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Wave conditions near Mumbai',
  'Is it safe to sail from Kochi?',
  'Fishing zones off Chennai coast',
  'Sea temperature near Goa',
  'Tide forecast for Arabian Sea',
];

// ── Component ─────────────────────────────────────────────────────────────────

const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  isStreaming,
  attachedLocation,
  onAttachLocation,
  placeholder = 'Ask about wave height, fishing zones, safety conditions...',
}) => {
  const [message, setMessage] = useState('');
  const [showLocPop, setShowLocPop] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 130) + 'px';
  }, [message]);

  // Close location popup on outside click
  useEffect(() => {
    if (!showLocPop) return;
    const handler = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setShowLocPop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLocPop]);

  const handleSend = useCallback(() => {
    if (!message.trim() || isStreaming) return;
    const fullMsg = attachedLocation
      ? message + ' [location: ' + attachedLocation.lat.toFixed(4) + ',' + attachedLocation.lon.toFixed(4) + ']'
      : message;
    onSendMessage(fullMsg);
    setMessage('');
    setShowSuggestions(false);
  }, [message, isStreaming, attachedLocation, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        onAttachLocation?.({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGpsLoading(false);
        setShowLocPop(false);
      },
      () => {
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const handleManualSet = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (isNaN(lat) || isNaN(lon)) return;
    onAttachLocation?.({ lat, lon });
    setManualLat('');
    setManualLon('');
    setShowLocPop(false);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--orca-bg-primary)',
    border: '1px solid rgba(255,255,255,0.07)',
    color: 'var(--orca-text-primary)',
    padding: '4px 8px',
    fontSize: '11px',
    fontFamily: 'ui-monospace, monospace',
    outline: 'none',
    width: '100%',
  };

  return (
    <div style={{
      borderTop: '1px solid var(--orca-border)',
      backgroundColor: 'var(--orca-bg-primary)',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* Suggestion chips (shown when input is focused and empty) */}
      {showSuggestions && !message && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setMessage(s); setShowSuggestions(false); textareaRef.current?.focus(); }}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--orca-text-muted)',
                fontSize: '11px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Attached location pill */}
      {attachedLocation && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(45,212,191,0.08)',
          border: '1px solid rgba(45,212,191,0.2)',
          padding: '3px 8px',
          fontSize: '11px',
          color: 'var(--orca-accent)',
          fontFamily: 'ui-monospace, monospace',
          alignSelf: 'flex-start',
        }}>
          <PinIcon active />
          <span>{attachedLocation.lat.toFixed(4)}, {attachedLocation.lon.toFixed(4)}</span>
          <button
            onClick={() => onAttachLocation?.(undefined)}
            style={{ background: 'none', border: 'none', color: 'var(--orca-accent)', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Input row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 6,
        backgroundColor: 'var(--orca-bg-secondary)',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '6px 8px',
      }}>
        {/* Location button */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={popRef}>
          <button
            onClick={() => setShowLocPop(o => !o)}
            disabled={isStreaming}
            title="Attach location"
            style={{
              background: 'none',
              border: 'none',
              cursor: isStreaming ? 'default' : 'pointer',
              padding: '6px',
              color: attachedLocation ? 'var(--orca-accent)' : 'var(--orca-text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <PinIcon active={!!attachedLocation} />
          </button>

          {showLocPop && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              marginBottom: 6,
              backgroundColor: 'var(--orca-bg-tertiary)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: 12,
              width: 200,
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              <div style={{ fontSize: '10px', color: 'var(--orca-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'ui-monospace, monospace' }}>
                Attach Location
              </div>
              <button
                onClick={handleGPS}
                disabled={gpsLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--orca-text-secondary)',
                  padding: '6px 10px',
                  fontSize: '11px',
                  cursor: gpsLoading ? 'wait' : 'pointer',
                }}
              >
                <GpsIcon />
                {gpsLoading ? 'Locating...' : 'Use GPS location'}
              </button>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: '10px', color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace' }}>OR ENTER MANUALLY</div>
                <input
                  type="number"
                  placeholder="Latitude"
                  value={manualLat}
                  onChange={e => setManualLat(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Longitude"
                  value={manualLon}
                  onChange={e => setManualLon(e.target.value)}
                  style={inputStyle}
                />
                <button
                  onClick={handleManualSet}
                  style={{
                    background: 'rgba(45,212,191,0.12)',
                    border: '1px solid rgba(45,212,191,0.3)',
                    color: 'var(--orca-accent)',
                    padding: '5px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Set
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={isStreaming ? 'Processing...' : placeholder}
          disabled={isStreaming}
          rows={1}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            color: 'var(--orca-text-primary)',
            fontSize: '13px',
            lineHeight: '1.5',
            padding: '4px 0',
            maxHeight: 130,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        />

        {/* Send / stop */}
        <button
          onClick={isStreaming ? undefined : handleSend}
          disabled={(!message.trim() && !isStreaming)}
          style={{
            background: 'none',
            border: 'none',
            cursor: isStreaming ? 'default' : (message.trim() ? 'pointer' : 'default'),
            color: message.trim() && !isStreaming
              ? 'var(--orca-accent)'
              : isStreaming
                ? 'var(--orca-warning)'
                : 'var(--orca-text-muted)',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
          title={isStreaming ? 'Processing' : 'Send (Enter)'}
        >
          {isStreaming ? <StopIcon /> : <SendIcon />}
        </button>
      </div>

      <div style={{
        fontSize: '10px',
        color: 'var(--orca-text-muted)',
        fontFamily: 'ui-monospace, monospace',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>Enter to send · Shift+Enter for newline</span>
        <span>Open-Meteo Marine API</span>
      </div>
    </div>
  );
};

export default InputBar;
