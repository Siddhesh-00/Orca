import { useState, useRef, useCallback } from 'react';
import { SSEEvent } from '../types';
import { streamChat } from '../services/api';

export const useSSE = () => {
  const [connectionState, setConnectionState] = useState<'idle'|'connecting'|'connected'|'error'>('idle');
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnectionState('idle');
  }, []);

  const connectSSE = useCallback((
    message: string, 
    threadId: string, 
    location: { lat: number; lon: number } | undefined,
    onEvent: (event: SSEEvent) => void
  ) => {
    disconnect();
    setConnectionState('connecting');

    const connect = () => {
      try {
        const es = streamChat(message, threadId, location);
        eventSourceRef.current = es;

        es.onopen = () => {
          setConnectionState('connected');
          retryCountRef.current = 0;
        };

        es.onmessage = (event) => {
          try {
            const parsed: SSEEvent = JSON.parse(event.data);
            onEvent(parsed);
          } catch (e) {
            console.error('Failed to parse SSE event', e);
          }
        };

        es.onerror = (err) => {
          es.close();
          setConnectionState('error');
          if (retryCountRef.current < maxRetries) {
            const backoff = Math.pow(2, retryCountRef.current) * 1000;
            retryCountRef.current += 1;
            setTimeout(connect, backoff);
          }
        };
      } catch (err) {
        setConnectionState('error');
      }
    };

    connect();
    return disconnect;
  }, [disconnect]);

  return {
    connectSSE,
    disconnect,
    isConnected: connectionState === 'connected',
    connectionState
  };
};
