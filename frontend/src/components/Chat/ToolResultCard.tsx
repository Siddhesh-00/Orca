import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToolResult } from '../../types';

interface ToolResultCardProps {
  result: ToolResult;
}

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease'
    }}
  >
    <path d="M4 6l4 4 4-4" />
  </svg>
);

const SuccessIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--orca-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l3 3 7-7" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--orca-danger)" strokeWidth="2" strokeLinecap="round">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

const ToolResultCard: React.FC<ToolResultCardProps> = ({ result }) => {
  const [expanded, setExpanded] = useState(false);

  const renderContent = () => {
    if (result.status === 'loading') {
      return (
        <div className="flex flex-col gap-2 p-2">
          <div className="h-2 w-3/4 bg-[var(--orca-bg-tertiary)] rounded animate-[pulse-subtle_2s_infinite]"></div>
          <div className="h-2 w-1/2 bg-[var(--orca-bg-tertiary)] rounded animate-[pulse-subtle_2s_infinite]"></div>
        </div>
      );
    }

    if (result.status === 'error') {
      return <div className="text-xs text-[var(--orca-danger)] p-2">{result.output || 'Execution failed'}</div>;
    }

    if (result.geojson) {
      return <div className="text-xs text-[var(--orca-accent)] cursor-pointer hover:underline p-2">View on map</div>;
    }

    if (typeof result.output === 'object' && result.output !== null) {
      return (
        <div className="grid grid-cols-2 gap-2 p-2">
          {Object.entries(result.output).slice(0, 6).map(([k, v]) => (
            <div key={k} className="flex flex-col">
              <span className="text-[10px] text-[var(--orca-text-muted)] uppercase tracking-wider">{k}</span>
              <span className="text-xs text-[var(--orca-text-primary)] font-mono">{String(v)}</span>
            </div>
          ))}
        </div>
      );
    }

    return <div className="text-xs text-[var(--orca-text-secondary)] p-2 font-mono break-words">{String(result.output)}</div>;
  };

  return (
    <div className="my-2 border border-[var(--orca-border)] rounded bg-[var(--orca-bg-secondary)] overflow-hidden max-w-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2 hover:bg-[var(--orca-bg-tertiary)] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[var(--orca-text-primary)]">{result.toolName}</span>
          {result.status === 'success' && <SuccessIcon />}
          {result.status === 'error' && <ErrorIcon />}
          {result.status === 'loading' && (
            <span className="text-[10px] text-[var(--orca-accent)] animate-[pulse-subtle_2s_infinite]">Fetching...</span>
          )}
        </div>
        <div className="text-[var(--orca-text-muted)]">
          <ChevronIcon expanded={expanded} />
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[var(--orca-border)] bg-[var(--orca-bg-primary)]"
          >
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolResultCard;
