import React, { useRef, useEffect, useState } from 'react';
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
  onNewSession?: () => void;
}

// ── Empty state ───────────────────────────────────────────────────────────────

const STARTER_QUERIES = [
  { label: 'Wave forecast', query: "What are the wave conditions near Mumbai?" },
  { label: 'Safety check', query: "Is it safe to go fishing near Kochi today?" },
  { label: 'Fishing zones', query: "Show me fishing zones off the Chennai coast" },
  { label: 'Sea temperature', query: "What is the sea surface temperature near Goa?" },
  { label: 'Wind conditions', query: "Wind and swell conditions near Mangalore" },
  { label: 'Tide information', query: "Tide forecast for the Arabian Sea" },
];

const EmptyState: React.FC<{ onQuery: (q: string) => void }> = ({ onQuery }) => (
  <div style={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    maxWidth: 520,
    margin: '0 auto',
    width: '100%',
  }}>
    {/* Header */}
    <div style={{ marginBottom: 32, textAlign: 'center' }}>
      <div style={{
        fontFamily: 'ui-monospace, monospace',
        fontSize: '11px',
        letterSpacing: '0.14em',
        color: 'var(--orca-text-muted)',
        textTransform: 'uppercase',
        marginBottom: 12,
      }}>
        ORCA · Marine Ecosystem Intelligence
      </div>
      <h1 style={{
        fontSize: '22px',
        fontWeight: 600,
        color: 'var(--orca-text-primary)',
        margin: 0,
        lineHeight: 1.3,
      }}>
        Ask about ocean conditions
      </h1>
      <p style={{
        fontSize: '13px',
        color: 'var(--orca-text-secondary)',
        marginTop: 8,
        lineHeight: 1.6,
      }}>
        Live data from Open-Meteo Marine API. Covers wave height, wind, sea temperature, safety advisories, and potential fishing zones.
      </p>
    </div>

    {/* Divider */}
    <div style={{
      width: '100%',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      marginBottom: 20,
    }} />

    {/* Starter queries */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      width: '100%',
    }}>
      <div style={{
        fontSize: '10px',
        color: 'var(--orca-text-muted)',
        fontFamily: 'ui-monospace, monospace',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 4,
      }}>
        Try asking
      </div>
      {STARTER_QUERIES.map(({ label, query }) => (
        <button
          key={label}
          onClick={() => onQuery(query)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '9px 12px',
            background: 'none',
            border: '1px solid rgba(255,255,255,0.05)',
            color: 'var(--orca-text-secondary)',
            fontSize: '13px',
            textAlign: 'left',
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(45,212,191,0.3)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--orca-text-primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.05)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--orca-text-secondary)';
          }}
        >
          <span>{query}</span>
          <span style={{
            fontSize: '10px',
            color: 'var(--orca-text-muted)',
            fontFamily: 'ui-monospace, monospace',
            flexShrink: 0,
          }}>
            {label}
          </span>
        </button>
      ))}
    </div>

    {/* Footer note */}
    <div style={{
      marginTop: 24,
      fontSize: '10px',
      color: 'var(--orca-text-muted)',
      fontFamily: 'ui-monospace, monospace',
      textAlign: 'center',
      lineHeight: 1.6,
    }}>
      Data from Open-Meteo Marine API · Nominatim geocoding
      <br />
      No API keys required · Refreshed per query
    </div>
  </div>
);

// ── Streaming indicator ───────────────────────────────────────────────────────

const StreamIndicator: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 0',
    color: 'var(--orca-text-muted)',
    fontSize: '11px',
    fontFamily: 'ui-monospace, monospace',
  }}>
    <div style={{ display: 'flex', gap: 3 }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 4,
            height: 4,
            backgroundColor: 'var(--orca-accent)',
            display: 'inline-block',
            animation: 'pulse-subtle 1.2s ease-in-out infinite',
            animationDelay: i * 0.2 + 's',
          }}
        />
      ))}
    </div>
    <span>Fetching marine data</span>
  </div>
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
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Auto-scroll when new content arrives
  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isStreaming, isAtBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distFromBottom < 80);
  };

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--orca-bg-primary)' }}>
      {/* Safety alerts */}
      <SafetyBanner alerts={safetyAlerts} onDismiss={onDismissAlert} />

      {/* Message area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 16px',
        }}
      >
        {messages.length === 0 ? (
          <EmptyState onQuery={onSendMessage} />
        ) : (
          <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', paddingTop: 24, paddingBottom: 16 }}>
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
            {/* Show dots if streaming but no content yet */}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <StreamIndicator />
            )}
          </div>
        )}
      </div>

      {/* Scroll-to-bottom button */}
      {!isAtBottom && messages.length > 0 && (
        <button
          onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
          style={{
            position: 'absolute',
            bottom: 120,
            right: 24,
            background: 'var(--orca-bg-surface)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--orca-text-secondary)',
            padding: '6px 10px',
            fontSize: '11px',
            cursor: 'pointer',
            fontFamily: 'ui-monospace, monospace',
            zIndex: 10,
          }}
        >
          Scroll down
        </button>
      )}

      {/* Input */}
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
