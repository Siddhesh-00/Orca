import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChatMessage, SafetyAlert as ISafetyAlert } from '../../types';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import SafetyBanner from './SafetyBanner';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isStreaming: boolean;
  safetyAlerts: ISafetyAlert[];
  onDismissAlert?: (index: number) => void;
  attachedLocation?: { lat: number; lon: number };
  onAttachLocation?: (loc: { lat: number; lon: number } | undefined) => void;
}

// ── Starter queries ───────────────────────────────────────────────────────────

const STARTERS = [
  { label: 'Wave forecast',   query: 'Wave conditions near Mumbai today' },
  { label: 'Safety check',    query: 'Is it safe to fish near Kochi today?' },
  { label: 'Fishing zones',   query: 'Show fishing zones off Chennai coast' },
  { label: 'Temperature',     query: 'Sea surface temperature near Goa' },
  { label: 'Wind conditions', query: 'Wind and swell near Mangalore' },
  { label: 'Tide schedule',   query: 'Tide forecast for Arabian Sea' },
];

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ onQuery: (q: string) => void }> = ({ onQuery }) => (
  <div
    className="anim-fade-in"
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      maxWidth: 480,
      margin: '0 auto',
      width: '100%',
    }}
  >
    {/* Title */}
    <div style={{ textAlign: 'center', marginBottom: 28 }}>
      <div style={{
        fontSize: 10, color: 'var(--orca-text-muted)',
        fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em',
        textTransform: 'uppercase', marginBottom: 10,
      }}>
        Marine Ecosystem Intelligence
      </div>
      <h1 style={{
        fontSize: 22, fontWeight: 600, color: 'var(--orca-text-primary)',
        margin: 0, lineHeight: 1.3,
      }}>
        Ask about ocean conditions
      </h1>
      <p style={{
        fontSize: 13, color: 'var(--orca-text-secondary)',
        margin: '10px 0 0', lineHeight: 1.65,
      }}>
        Live data from Open-Meteo Marine API. Covers waves, wind, sea temperature, tides, safety, and fishing zones.
      </p>
    </div>

    {/* Divider */}
    <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: 18 }} />

    {/* Starter queries */}
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{
        fontSize: 9, color: 'var(--orca-text-muted)',
        fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase',
        letterSpacing: '0.07em', marginBottom: 4,
      }}>
        Try asking
      </div>
      <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {STARTERS.map(({ label, query }) => (
          <button
            key={label}
            onClick={() => onQuery(query)}
            className="anim-slide-up"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              padding: '9px 12px',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'var(--orca-text-secondary)',
              fontSize: 13,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
              animationFillMode: 'both',
            }}
            onMouseEnter={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = 'rgba(45,212,191,0.3)';
              b.style.color = 'var(--orca-text-primary)';
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = 'rgba(255,255,255,0.06)';
              b.style.color = 'var(--orca-text-secondary)';
            }}
          >
            <span>{query}</span>
            <span style={{
              fontSize: 9, color: 'var(--orca-text-muted)',
              fontFamily: 'ui-monospace, monospace', flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.08)', padding: '2px 6px',
            }}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>

    <div style={{
      marginTop: 20, fontSize: 10, color: 'var(--orca-text-muted)',
      fontFamily: 'ui-monospace, monospace', textAlign: 'center', lineHeight: 1.6,
    }}>
      Open-Meteo Marine API · Nominatim geocoding · No API keys required
    </div>
  </div>
);

// ── Scroll-to-bottom button ───────────────────────────────────────────────────

const ScrollDownBtn: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="anim-scale-in"
    style={{
      position: 'absolute',
      bottom: 16,
      right: 16,
      backgroundColor: 'var(--orca-bg-surface)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: 'var(--orca-text-secondary)',
      padding: '5px 10px',
      fontSize: 10,
      cursor: 'pointer',
      fontFamily: 'ui-monospace, monospace',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 5,
    }}
  >
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
    New messages
  </button>
);

// ── Main component ────────────────────────────────────────────────────────────

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isStreaming,
  safetyAlerts,
  onDismissAlert,
  attachedLocation,
  onAttachLocation,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const isAtBottomRef = useRef(true);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = dist < 80;
    setShowScrollBtn(dist > 200);
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Scroll to bottom on first render
  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--orca-bg-primary)',
      overflow: 'hidden',
    }}>
      {/* Safety banners */}
      {safetyAlerts.length > 0 && (
        <SafetyBanner alerts={safetyAlerts} onDismiss={onDismissAlert} />
      )}

      {/* Message area — position: relative to anchor scroll button */}
      <div
        style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
      >
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '0 16px',
          }}
        >
          {messages.length === 0 ? (
            <EmptyState onQuery={onSendMessage} />
          ) : (
            <div style={{ maxWidth: 720, margin: '0 auto', paddingTop: 24, paddingBottom: 12 }}>
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isStreamingLast={
                    isStreaming &&
                    idx === messages.length - 1 &&
                    msg.role === 'assistant'
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Scroll-to-bottom button — correctly inside positioned parent */}
        {showScrollBtn && <ScrollDownBtn onClick={() => scrollToBottom()} />}
      </div>

      {/* Input bar */}
      <div style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <InputBar
          onSendMessage={onSendMessage}
          isStreaming={isStreaming}
          attachedLocation={attachedLocation}
          onAttachLocation={onAttachLocation}
        />
      </div>
    </div>
  );
};

export default ChatPanel;
