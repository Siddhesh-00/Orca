import { useState, useCallback } from 'react';
import { ChatMessage, SafetyAlert, SSEEvent } from '../types';
import { useSSE } from './useSSE';
import { useSession } from './useSession';

export const useChat = () => {
  const { threadId } = useSession();
  const { connectSSE, disconnect: _disconnect } = useSSE();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | undefined>();

  const sendMessage = useCallback((content: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      toolResults: []
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    connectSSE(content, threadId, userLocation, (event: SSEEvent) => {
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastIdx = newMsgs.length - 1;
        if (newMsgs[lastIdx].id !== assistantId) return prev;
        
        const current = { ...newMsgs[lastIdx] };

        if (event.type === 'token') {
          current.content += event.payload;
        } else if (event.type === 'tool_start') {
          current.toolResults = current.toolResults || [];
          current.toolResults.push({
            toolName: event.payload.toolName,
            input: event.payload.input,
            output: null,
            status: 'loading'
          });
        } else if (event.type === 'tool_end') {
          current.toolResults = current.toolResults || [];
          const idx = current.toolResults.findIndex(t => t.toolName === event.payload.toolName && t.status === 'loading');
          if (idx !== -1) {
            current.toolResults[idx] = {
              ...current.toolResults[idx],
              output: event.payload.output,
              status: 'success'
            };
          }
        } else if (event.type === 'safety_alert') {
          setSafetyAlerts(s => [...s, event.payload as SafetyAlert]);
        } else if (event.type === 'done') {
          setIsStreaming(false);
        }

        newMsgs[lastIdx] = current;
        return newMsgs;
      });
    });
  }, [threadId, userLocation, connectSSE]);

  const clearMessages = useCallback(() => setMessages([]), []);
  const dismissAlert = useCallback((index: number) => {
    setSafetyAlerts(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    messages,
    isStreaming,
    safetyAlerts,
    sendMessage,
    clearMessages,
    dismissAlert,
    threadId,
    userLocation,
    setUserLocation
  };
};
