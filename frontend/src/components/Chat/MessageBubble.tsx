import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../../types';
import ToolResultCard from './ToolResultCard';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreamingLast?: boolean;
}

// Typing cursor
const Cursor = () => (
  <span style={{
    display: 'inline-block',
    width: 2,
    height: '1em',
    backgroundColor: 'var(--orca-accent)',
    marginLeft: 2,
    verticalAlign: 'middle',
    animation: 'pulse-subtle 0.8s infinite',
  }} />
);

// Timestamp badge
const Timestamp: React.FC<{ iso: string }> = ({ iso }) => (
  <span style={{
    fontSize: 10,
    color: 'var(--orca-text-muted)',
    fontFamily: 'ui-monospace, monospace',
    whiteSpace: 'nowrap',
  }}>
    {new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  </span>
);

// Markdown component overrides — sharp corners, dark theme
const mdComponents: any = {
  code({ node: _node, inline, className, children, ...props }: any) {
    return !inline ? (
      <pre style={{
        backgroundColor: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '10px 14px',
        overflowX: 'auto',
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 12,
        margin: '8px 0',
        lineHeight: 1.6,
      }}>
        <code className={className} {...props}>{children}</code>
      </pre>
    ) : (
      <code style={{
        backgroundColor: 'rgba(45,212,191,0.1)',
        border: '1px solid rgba(45,212,191,0.15)',
        padding: '1px 5px',
        fontFamily: 'ui-monospace, monospace',
        fontSize: '0.88em',
        color: 'var(--orca-accent)',
      }} {...props}>
        {children}
      </code>
    );
  },
  a({ node: _node, ...props }: any) {
    return (
      <a
        style={{ color: 'var(--orca-accent)', textDecoration: 'none', borderBottom: '1px solid rgba(45,212,191,0.4)' }}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    );
  },
  table({ node: _node, ...props }: any) {
    return (
      <div style={{ overflowX: 'auto', margin: '10px 0', border: '1px solid rgba(255,255,255,0.07)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }} {...props} />
      </div>
    );
  },
  thead({ node: _node, ...props }: any) {
    return <thead style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} {...props} />;
  },
  th({ node: _node, ...props }: any) {
    return (
      <th style={{
        padding: '6px 10px',
        textAlign: 'left',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--orca-text-muted)',
        fontWeight: 500,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'ui-monospace, monospace',
      }} {...props} />
    );
  },
  td({ node: _node, ...props }: any) {
    return (
      <td style={{
        padding: '6px 10px',
        fontSize: 12,
        color: 'var(--orca-text-primary)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        fontFamily: 'ui-monospace, monospace',
      }} {...props} />
    );
  },
  blockquote({ node: _node, ...props }: any) {
    return (
      <blockquote style={{
        borderLeft: '2px solid var(--orca-accent)',
        paddingLeft: 12,
        margin: '8px 0',
        color: 'var(--orca-text-secondary)',
        fontSize: 13,
      }} {...props} />
    );
  },
  hr() {
    return <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '12px 0' }} />;
  },
  h1({ node: _node, ...props }: any) {
    return <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--orca-text-primary)', margin: '12px 0 6px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 6 }} {...props} />;
  },
  h2({ node: _node, ...props }: any) {
    return <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--orca-text-primary)', margin: '10px 0 6px' }} {...props} />;
  },
  h3({ node: _node, ...props }: any) {
    return <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--orca-text-secondary)', margin: '8px 0 4px' }} {...props} />;
  },
  p({ node: _node, ...props }: any) {
    return <p style={{ margin: '6px 0', lineHeight: 1.65 }} {...props} />;
  },
  ul({ node: _node, ...props }: any) {
    return <ul style={{ paddingLeft: 18, margin: '6px 0' }} {...props} />;
  },
  li({ node: _node, ...props }: any) {
    return <li style={{ margin: '3px 0', lineHeight: 1.55 }} {...props} />;
  },
  strong({ node: _node, ...props }: any) {
    return <strong style={{ color: 'var(--orca-text-primary)', fontWeight: 600 }} {...props} />;
  },
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreamingLast }) => {
  const isUser    = message.role === 'user';
  const isSystem  = message.role === 'system';

  if (isSystem) {
    return (
      <div
        className="anim-fade-in"
        style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}
      >
        <div style={{
          fontSize: 11,
          color: 'var(--orca-text-muted)',
          padding: '4px 12px',
          border: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: 'var(--orca-bg-secondary)',
          fontFamily: 'ui-monospace, monospace',
        }}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={isUser ? 'anim-slide-up' : 'anim-slide-up'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 20,
        animationFillMode: 'both',
      }}
    >
      {/* Role label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5,
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}>
        {/* Avatar dot */}
        <div style={{
          width: 20, height: 20,
          backgroundColor: isUser ? 'var(--orca-bg-surface)' : 'rgba(45,212,191,0.15)',
          border: '1px solid ' + (isUser ? 'rgba(255,255,255,0.1)' : 'rgba(45,212,191,0.3)'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {isUser ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--orca-text-muted)" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--orca-accent)" strokeWidth="2">
              <path d="M2 12c2.67 0 4-2 6.67-2s4 2 6.67 2 4-2 6.67-2" />
            </svg>
          )}
        </div>
        <span style={{
          fontSize: 10, color: 'var(--orca-text-muted)',
          fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {isUser ? 'You' : 'ORCA'}
        </span>
        <Timestamp iso={message.timestamp} />
      </div>

      {/* Bubble content */}
      <div style={{
        maxWidth: '88%',
        padding: isUser ? '10px 14px' : '2px 0',
        backgroundColor: isUser ? 'var(--orca-bg-surface)' : 'transparent',
        border: isUser ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}>
        {/* Tool results */}
        {!isUser && message.toolResults && message.toolResults.length > 0 && (
          <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {message.toolResults.map((r, i) => <ToolResultCard key={i} result={r} />)}
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <div style={{
            fontSize: 13,
            lineHeight: 1.65,
            color: 'var(--orca-text-primary)',
          }}>
            {isUser ? (
              <span>{message.content}</span>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {message.content}
              </ReactMarkdown>
            )}
            {isStreamingLast && <Cursor />}
          </div>
        )}

        {/* Empty streaming state */}
        {!message.content && isStreamingLast && (
          <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
