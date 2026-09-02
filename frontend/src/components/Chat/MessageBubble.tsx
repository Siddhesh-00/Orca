import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { ChatMessage } from '../../types';
import ToolResultCard from './ToolResultCard';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreamingLast?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreamingLast }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-center my-4"
      >
        <div className="text-xs text-[var(--orca-text-muted)] px-4 py-1 rounded bg-[var(--orca-bg-secondary)] border border-[var(--orca-border)]">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group relative`}
    >
      <div 
        className={`max-w-[85%] sm:max-w-[75%] relative ${
          isUser 
            ? 'bg-[var(--orca-bg-surface)] rounded text-[var(--orca-text-primary)] px-4 py-3' 
            : 'text-[var(--orca-text-primary)] px-2 py-1'
        }`}
      >
        <span className="absolute -top-4 right-0 text-[10px] text-[var(--orca-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        {message.toolResults && message.toolResults.length > 0 && (
          <div className="mb-2 flex flex-col gap-1">
            {message.toolResults.map((result, idx) => (
              <ToolResultCard key={idx} result={result} />
            ))}
          </div>
        )}

        {message.content && (
          <div className={`text-sm leading-relaxed prose prose-invert max-w-none ${
            isUser ? '' : 'prose-pre:bg-[var(--orca-bg-primary)] prose-pre:border prose-pre:border-[var(--orca-border)] prose-pre:rounded'
          }`}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <pre className="font-mono text-xs overflow-x-auto p-3">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="bg-[var(--orca-bg-tertiary)] px-1 py-0.5 rounded font-mono text-[0.9em]" {...props}>
                      {children}
                    </code>
                  );
                },
                a({node, ...props}) {
                  return <a className="text-[var(--orca-accent)] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />;
                },
                table({node, ...props}) {
                  return (
                    <div className="overflow-x-auto my-2 border border-[var(--orca-border)] rounded">
                      <table className="min-w-full divide-y divide-[var(--orca-border)]" {...props} />
                    </div>
                  );
                },
                th({node, ...props}) {
                  return <th className="px-3 py-2 bg-[var(--orca-bg-secondary)] text-left text-xs font-semibold text-[var(--orca-text-secondary)] uppercase tracking-wider" {...props} />;
                },
                td({node, ...props}) {
                  return <td className="px-3 py-2 text-sm text-[var(--orca-text-primary)] border-t border-[var(--orca-border)]" {...props} />;
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        
        {isStreamingLast && (
          <div className="inline-block w-1.5 h-4 ml-1 bg-[var(--orca-accent)] animate-[pulse-subtle_1s_infinite] align-middle"></div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
