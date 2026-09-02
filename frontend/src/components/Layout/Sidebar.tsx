import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChatSession } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeId: string;
  onNewSession: () => void;
  onSwitchSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

// ── Icons (inline SVG only, no Lucide) ────────────────────────────────────────

const MenuIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ChatIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

// ── Relative time ─────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────────

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  sessions,
  activeId,
  onNewSession,
  onSwitchSession,
  onDeleteSession,
}) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDelete === id) {
      onDeleteSession(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 2500);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 248 : 44 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{
        height: '100%',
        backgroundColor: 'var(--orca-bg-secondary)',
        borderRight: '1px solid var(--orca-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div style={{
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        borderBottom: '1px solid var(--orca-border)',
        gap: 8,
        flexShrink: 0,
      }}>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--orca-text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
          }}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <MenuIcon />
        </button>

        {isOpen && (
          <span style={{
            fontSize: '11px',
            color: 'var(--orca-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: 'ui-monospace, monospace',
            flex: 1,
          }}>
            Sessions
          </span>
        )}
      </div>

      {/* New chat button */}
      <div style={{ padding: '8px', flexShrink: 0 }}>
        <button
          onClick={onNewSession}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: isOpen ? '7px 10px' : '7px',
            background: 'none',
            border: '1px solid var(--orca-border)',
            color: 'var(--orca-text-secondary)',
            cursor: 'pointer',
            fontSize: '12px',
            justifyContent: isOpen ? 'flex-start' : 'center',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--orca-accent)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--orca-accent)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--orca-border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--orca-text-secondary)';
          }}
          title="New conversation"
        >
          <PlusIcon />
          {isOpen && <span>New conversation</span>}
        </button>
      </div>

      {/* Session list */}
      {isOpen && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 8px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {sessions.length === 0 && (
            <div style={{
              fontSize: '11px',
              color: 'var(--orca-text-muted)',
              textAlign: 'center',
              padding: '24px 8px',
              fontFamily: 'ui-monospace, monospace',
            }}>
              No sessions yet
            </div>
          )}
          {sessions.map(session => {
            const isActive = session.id === activeId;
            return (
              <div
                key={session.id}
                onClick={() => onSwitchSession(session.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--orca-bg-surface)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.03)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{
                  flexShrink: 0,
                  marginTop: 2,
                  color: isActive ? 'var(--orca-accent)' : 'var(--orca-text-muted)',
                }}>
                  <ChatIcon />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '12px',
                    color: isActive ? 'var(--orca-text-primary)' : 'var(--orca-text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.3,
                  }}>
                    {session.title}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--orca-text-muted)',
                    marginTop: 2,
                    fontFamily: 'ui-monospace, monospace',
                  }}>
                    {relativeTime(session.updatedAt)} · {session.messages.length} msg{session.messages.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <button
                  onClick={e => handleDelete(e, session.id)}
                  title={confirmDelete === session.id ? 'Click again to confirm' : 'Delete session'}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: confirmDelete === session.id ? 'var(--orca-danger)' : 'var(--orca-text-muted)',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    flexShrink: 0,
                    opacity: 0.6,
                    marginTop: 1,
                  }}
                >
                  <TrashIcon />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Collapsed icon list */}
      {!isOpen && sessions.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sessions.slice(0, 8).map(s => (
            <button
              key={s.id}
              onClick={() => onSwitchSession(s.id)}
              title={s.title}
              style={{
                background: s.id === activeId ? 'var(--orca-bg-surface)' : 'none',
                border: '1px solid ' + (s.id === activeId ? 'rgba(255,255,255,0.08)' : 'transparent'),
                color: s.id === activeId ? 'var(--orca-accent)' : 'var(--orca-text-muted)',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <ChatIcon />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;
