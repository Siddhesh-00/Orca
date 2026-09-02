// useSSE is preserved for future backend integration.
// Currently the app uses direct API calls via useChat + services/orca.ts
// This hook provides the SSE infrastructure to connect to a FastAPI backend
// when the Python backend is running.

import { useState, useRef, useCallback } from 'react';
import { SSEEvent } from '../types';

interface SSEOptions {
  onToken?: (content: string) => void;
  onToolStart?: (tool: string, input: any) => void;
  onToolEnd?: (tool: string, output: any) => void;
  onGeoJSON?: (layerId: string, data: any) => void;
  onSafetyAlert?: (level: string, title: string, message: string) => void;
  onDone?: () => void;
  onError?: (err: string) => void;
}

export const useSSE = () => {
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);

  const disconnect = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    setConnectionState('idle');
  }, []);

  const connect = useCallback((
    message: string,
    threadId: string,
    location: { lat: number; lon: number } | undefined,
    opts: SSEOptions
  ) => {
    disconnect();
    setConnectionState('connecting');
    retryRef.current = 0;

    const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';
    const params = new URLSearchParams({
      message,
      thread_id: threadId,
      ...(location ? { lat: String(location.lat), lon: String(location.lon) } : {}),
    });

    const attempt = () => {
      try {
        const es = new EventSource(`${backendUrl}/api/chat/stream?${params}`);
        esRef.current = es;

        es.onopen = () => {
          setConnectionState('connected');
          retryRef.current = 0;
        };

        es.onmessage = evt => {
          try {
            const parsed: SSEEvent = JSON.parse(evt.data);
            switch (parsed.type) {
              case 'token':        opts.onToken?.(parsed.payload.content);                                              break;
              case 'tool_start':   opts.onToolStart?.(parsed.payload.tool, parsed.payload.input);                      break;
              case 'tool_end':     opts.onToolEnd?.(parsed.payload.tool, parsed.payload.output);                       break;
              case 'geojson':      opts.onGeoJSON?.(parsed.payload.layer_id, parsed.payload.data);                     break;
              case 'safety_alert': opts.onSafetyAlert?.(parsed.payload.level, parsed.payload.title, parsed.payload.message); break;
              case 'done':         opts.onDone?.(); es.close(); setConnectionState('idle');                             break;
            }
          } catch (e) {
            console.error('SSE parse error:', e);
          }
        };

        es.onerror = () => {
          es.close();
          setConnectionState('error');
          if (retryRef.current < 3) {
            const delay = Math.pow(2, retryRef.current) * 1000;
            retryRef.current++;
            setTimeout(attempt, delay);
          } else {
            opts.onError?.('Connection failed after 3 retries');
          }
        };
      } catch (err) {
        setConnectionState('error');
        opts.onError?.('Failed to create SSE connection');
      }
    };

    attempt();
    return disconnect;
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected: connectionState === 'connected',
    connectionState,
  };
};
