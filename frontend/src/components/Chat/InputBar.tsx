import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputBarProps {
  onSendMessage: (msg: string) => void;
  isStreaming: boolean;
}

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 8h12M10 4l4 4-4 4" />
  </svg>
);

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 14s5-4 5-8a5 5 0 00-10 0c0 4 5 8 5 8z" />
    <circle cx="8" cy="6" r="2" />
  </svg>
);

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isStreaming }) => {
  const [message, setMessage] = useState('');
  const [showLocationPop, setShowLocationPop] = useState(false);
  const [location, setLocation] = useState<{lat: string, lon: string} | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() || isStreaming) return;
    onSendMessage(message);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full border-t border-[var(--orca-border)] bg-[var(--orca-bg-primary)] p-4 flex flex-col gap-2 relative">
      {location && (
        <div className="flex items-center gap-2 self-start bg-[var(--orca-bg-surface)] border border-[var(--orca-border)] px-2 py-1 rounded text-xs text-[var(--orca-text-secondary)]">
          <PinIcon />
          <span className="font-mono">{location.lat}, {location.lon}</span>
          <button 
            onClick={() => setLocation(null)}
            className="ml-1 text-[var(--orca-text-muted)] hover:text-[var(--orca-text-primary)]"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-[var(--orca-bg-secondary)] border border-[var(--orca-border)] rounded focus-within:border-[var(--orca-border-active)] transition-colors p-2">
        <div className="relative">
          <button
            onClick={() => setShowLocationPop(!showLocationPop)}
            className="p-2 text-[var(--orca-text-muted)] hover:text-[var(--orca-text-primary)] transition-colors rounded"
            disabled={isStreaming}
            title="Attach Location"
          >
            <PinIcon />
          </button>
          
          <AnimatePresence>
            {showLocationPop && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 bg-[var(--orca-bg-tertiary)] border border-[var(--orca-border)] p-3 rounded flex flex-col gap-2 w-48 z-10"
              >
                <div className="text-xs text-[var(--orca-text-secondary)]">Enter Coordinates</div>
                <input
                  type="text"
                  placeholder="Lat"
                  className="bg-[var(--orca-bg-primary)] border border-[var(--orca-border)] rounded p-1 text-xs text-[var(--orca-text-primary)] focus:outline-none focus:border-[var(--orca-accent)]"
                  id="lat-input"
                />
                <input
                  type="text"
                  placeholder="Lon"
                  className="bg-[var(--orca-bg-primary)] border border-[var(--orca-border)] rounded p-1 text-xs text-[var(--orca-text-primary)] focus:outline-none focus:border-[var(--orca-accent)]"
                  id="lon-input"
                />
                <button
                  className="bg-[var(--orca-surface)] border border-[var(--orca-border)] hover:bg-[var(--orca-bg-primary)] text-xs text-[var(--orca-text-primary)] p-1 rounded"
                  onClick={() => {
                    const lat = (document.getElementById('lat-input') as HTMLInputElement)?.value;
                    const lon = (document.getElementById('lon-input') as HTMLInputElement)?.value;
                    if (lat && lon) {
                      setLocation({ lat, lon });
                      setShowLocationPop(false);
                    }
                  }}
                >
                  Set
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? "Agent is thinking..." : "Type your message..."}
          disabled={isStreaming}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none text-[var(--orca-text-primary)] placeholder-[var(--orca-text-muted)] text-sm py-2 max-h-[120px] font-sans"
          style={{ systemFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() || isStreaming}
          className={`p-2 rounded transition-colors ${
            message.trim() && !isStreaming
              ? 'bg-[var(--orca-bg-surface)] text-[var(--orca-accent)] hover:bg-[var(--orca-bg-tertiary)]'
              : 'text-[var(--orca-text-muted)] cursor-not-allowed'
          }`}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default InputBar;
