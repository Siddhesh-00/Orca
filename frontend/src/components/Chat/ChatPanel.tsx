import React, { useRef, useEffect } from 'react';
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
}

const WaveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--orca-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-[wave_3s_ease-in-out_infinite]">
    <path d="M2 12c2 0 4-4 6-4s4 4 6 4 4-4 6-4" />
    <path d="M2 18c2 0 4-4 6-4s4 4 6 4 4-4 6-4" opacity="0.5" />
  </svg>
);

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isStreaming, safetyAlerts, onDismissAlert }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isStreaming]);

  const suggestions = [
    "What's the wave forecast near Mumbai?",
    "Show fishing zones off Chennai",
    "Is it safe to sail from Kochi tomorrow?",
    "Tide schedule at Visakhapatnam"
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[var(--orca-bg-primary)]">
      <SafetyBanner alerts={safetyAlerts} onDismiss={onDismissAlert} />
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold text-[var(--orca-text-primary)] tracking-tight">ORCA</h1>
              <WaveIcon />
            </div>
            <p className="text-[var(--orca-text-secondary)] text-sm mb-8">
              Ask me about ocean conditions, tides, fishing zones, or marine safety.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(suggestion)}
                  className="bg-[var(--orca-bg-secondary)] border border-[var(--orca-border)] hover:border-[var(--orca-accent)] text-[var(--orca-text-primary)] text-sm px-4 py-3 rounded text-left transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full">
            {messages.map((msg, idx) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isStreamingLast={isStreaming && idx === messages.length - 1 && msg.role === 'assistant'} 
              />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto w-full">
        <InputBar onSendMessage={onSendMessage} isStreaming={isStreaming} />
      </div>
    </div>
  );
};

export default ChatPanel;
