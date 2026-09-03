import React, { useState } from 'react';
import { ToolResult } from '../../types';

interface ToolResultCardProps {
  result: ToolResult;
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="10" height="10" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const StatusIcon = ({ status }: { status: ToolResult['status'] }) => {
  if (status === 'loading') return (
    <span style={{ display: 'flex', gap: 3 }}>
      {[0,1,2].map(i => (
        <span key={i} className="typing-dot" style={{ animationDelay: i * 0.15 + 's' }} />
      ))}
    </span>
  );
  if (status === 'success') return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--orca-success)" strokeWidth="2.5" strokeLinecap="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--orca-danger)" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
};

function formatOutput(output: any): React.ReactNode {
  if (output === null || output === undefined) return null;

  if (typeof output === 'object') {
    const entries = Object.entries(output).slice(0, 10);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {entries.map(([k, v]) => (
          <div key={k} style={{
            display: 'flex', justifyContent: 'space-between', gap: 12,
            padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ fontSize: 10, color: 'var(--orca-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'ui-monospace, monospace' }}>
              {k}
            </span>
            <span style={{ fontSize: 11, color: 'var(--orca-text-primary)', fontFamily: 'ui-monospace, monospace' }}>
              {typeof v === 'number' ? (Number.isInteger(v) ? v : (v as number).toFixed(2)) : String(v)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span style={{ fontSize: 11, color: 'var(--orca-text-secondary)', fontFamily: 'ui-monospace, monospace' }}>
      {String(output)}
    </span>
  );
}

const ToolResultCard: React.FC<ToolResultCardProps> = ({ result }) => {
  const [expanded, setExpanded] = useState(false);
  const hasOutput = result.output !== null && result.output !== undefined;

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.07)',
      backgroundColor: 'rgba(10,22,40,0.6)',
      fontSize: 12,
      maxWidth: 420,
      animation: 'fadeIn 0.25s ease',
    }}>
      {/* Header row */}
      <button
        onClick={() => hasOutput && setExpanded(e => !e)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          background: 'none',
          border: 'none',
          cursor: hasOutput ? 'pointer' : 'default',
          color: 'var(--orca-text-primary)',
          textAlign: 'left',
        }}
        onMouseEnter={e => {
          if (hasOutput) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.03)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
        }}
      >
        <StatusIcon status={result.status} />
        <span style={{
          flex: 1,
          fontFamily: 'ui-monospace, monospace',
          fontSize: 11,
          color: result.status === 'loading' ? 'var(--orca-text-muted)' : 'var(--orca-text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {result.toolName}
        </span>
        {result.input?.location && (
          <span style={{
            fontSize: 9, color: 'var(--orca-accent)', fontFamily: 'ui-monospace, monospace',
            border: '1px solid rgba(45,212,191,0.2)', padding: '1px 5px', flexShrink: 0,
          }}>
            {result.input.location}
          </span>
        )}
        {hasOutput && (
          <span style={{ color: 'var(--orca-text-muted)', flexShrink: 0 }}>
            <ChevronIcon open={expanded} />
          </span>
        )}
      </button>

      {/* Expanded output */}
      {expanded && hasOutput && (
        <div
          className="anim-slide-up"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '8px 10px',
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        >
          {formatOutput(result.output)}
        </div>
      )}
    </div>
  );
};

export default ToolResultCard;
