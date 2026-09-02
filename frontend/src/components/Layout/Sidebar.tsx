import React from 'react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const MessageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
  </svg>
);

const mockSessions = [
  { id: '1', title: 'Mumbai wave forecast', time: '10:42 AM' },
  { id: '2', title: 'Fishing zones near Chennai', time: 'Yesterday' },
  { id: '3', title: 'Kochi sailing route safety', time: 'Oct 12' }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 260 : 48 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full bg-[var(--orca-bg-secondary)] border-r border-[var(--orca-border)] flex flex-col overflow-hidden shrink-0"
    >
      <div className="h-12 flex items-center px-3 border-b border-[var(--orca-border)] shrink-0">
        <button 
          onClick={onToggle}
          className="p-1.5 text-[var(--orca-text-secondary)] hover:text-[var(--orca-text-primary)] rounded transition-colors"
        >
          <MenuIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2 px-2">
        <button className="flex items-center gap-2 p-2 w-full rounded bg-[var(--orca-bg-surface)] border border-[var(--orca-border)] hover:border-[var(--orca-border-active)] transition-colors text-[var(--orca-text-primary)]">
          <span className="flex-shrink-0 flex items-center justify-center w-6"><PlusIcon /></span>
          {isOpen && <span className="text-sm truncate font-medium">New Chat</span>}
        </button>

        {isOpen && (
          <div className="mt-4 flex flex-col gap-1">
            <span className="text-xs text-[var(--orca-text-muted)] uppercase tracking-wider px-2 pb-1 font-semibold">Recent</span>
            {mockSessions.map((session) => (
              <button 
                key={session.id}
                className="flex flex-col items-start gap-1 p-2 w-full rounded hover:bg-[var(--orca-bg-surface)] transition-colors text-left group"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-[var(--orca-text-muted)] group-hover:text-[var(--orca-text-secondary)] flex-shrink-0"><MessageIcon /></span>
                  <span className="text-sm text-[var(--orca-text-secondary)] group-hover:text-[var(--orca-text-primary)] truncate flex-1">{session.title}</span>
                </div>
                <span className="text-[10px] text-[var(--orca-text-muted)] pl-6">{session.time}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;
