import { useState, useCallback, useRef } from 'react';
import { ChatMessage, ChatSession, SafetyAlert } from '../types';
import { processQuery, OrcaQueryResult } from '../services/orca';

const SESSIONS_KEY = 'orca_sessions_v2';
const ACTIVE_KEY = 'orca_active_session_v2';
const MAX_SESSIONS = 30;

// ─── Persistence ──────────────────────────────────────────────────────────────

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(sessions: ChatSession[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  } catch {
    // localStorage full — trim oldest and retry
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 10)));
    } catch { /* ignore */ }
  }
}

function titleFromContent(content: string): string {
  const text = content.replace(/\n/g, ' ').trim();
  return text.length > 45 ? text.slice(0, 42) + '...' : text;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseChatOptions {
  onMarineData?: (result: OrcaQueryResult) => void;
}

export const useChat = ({ onMarineData }: UseChatOptions = {}) => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
  const [activeId, setActiveId] = useState<string>(
    () => localStorage.getItem(ACTIVE_KEY) ?? ''
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | undefined>();
  const streamTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived
  const activeSession = sessions.find(s => s.id === activeId) ?? null;
  const messages = activeSession?.messages ?? [];

  // ─── Session management ─────────────────────────────────────────────────────

  const updateSessions = useCallback((updated: ChatSession[]) => {
    setSessions(updated);
    persist(updated);
  }, []);

  const newSession = useCallback(() => {
    if (streamTimer.current) clearTimeout(streamTimer.current);
    setIsStreaming(false);
    setSafetyAlerts([]);

    const id = crypto.randomUUID();
    const session: ChatSession = {
      id,
      title: 'New conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [session, ...sessions];
    updateSessions(updated);
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
  }, [sessions, updateSessions]);

  const switchSession = useCallback((id: string) => {
    if (streamTimer.current) clearTimeout(streamTimer.current);
    setIsStreaming(false);
    setSafetyAlerts([]);
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
  }, []);

  const deleteSession = useCallback((id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    updateSessions(updated);
    if (activeId === id) {
      const next = updated[0];
      if (next) {
        setActiveId(next.id);
        localStorage.setItem(ACTIVE_KEY, next.id);
      } else {
        setActiveId('');
        localStorage.removeItem(ACTIVE_KEY);
      }
    }
  }, [sessions, activeId, updateSessions]);

  const renameSession = useCallback((id: string, title: string) => {
    const updated = sessions.map(s => s.id === id ? { ...s, title } : s);
    updateSessions(updated);
  }, [sessions, updateSessions]);

  // ─── Messaging ──────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    // Ensure we have an active session
    let sid = activeId;
    let current = sessions;

    if (!sid || !current.find(s => s.id === sid)) {
      const id = crypto.randomUUID();
      const session: ChatSession = {
        id,
        title: titleFromContent(content),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      current = [session, ...current];
      sid = id;
      setActiveId(id);
      localStorage.setItem(ACTIVE_KEY, id);
    }

    // Add user + empty assistant messages
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    const assistantId = crypto.randomUUID();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      toolResults: [{
        toolName: 'Resolving location...',
        input: { query: content },
        output: null,
        status: 'loading',
      }],
    };

    const withMsgs = current.map(s => s.id !== sid ? s : {
      ...s,
      title: s.messages.length === 0 ? titleFromContent(content) : s.title,
      updatedAt: new Date().toISOString(),
      messages: [...s.messages, userMsg, assistantMsg],
    });
    updateSessions(withMsgs);
    setSessions(withMsgs);
    setIsStreaming(true);

    // Fetch real data
    let result: OrcaQueryResult;
    try {
      result = await processQuery(content, userLocation);
    } catch (err) {
      result = {
        text: 'Unable to retrieve marine data. Please check your connection and try again.',
        intent: 'general',
        toolsUsed: [],
      };
    }

    // Notify parent (update charts/map)
    if (onMarineData) onMarineData(result);

    // Surface safety alerts
    if (result.safetyAlerts?.length) {
      setSafetyAlerts(prev => {
        const existing = new Set(prev.map(a => a.title));
        const newAlerts = result.safetyAlerts!.filter(a => !existing.has(a.title));
        return [...prev, ...newAlerts];
      });
    }

    // Update tool result to success
    const toolLabel = result.toolsUsed.join(' + ') || 'general_response';
    const withTool = withMsgs.map(s => s.id !== sid ? s : {
      ...s,
      locationName: result.locationName,
      locationCoords: result.locationCoords,
      messages: s.messages.map(m => m.id !== assistantId ? m : {
        ...m,
        toolResults: [{
          toolName: toolLabel,
          input: { query: content, location: result.locationName ?? null },
          output: result.marineData ?? { status: 'no_data' },
          status: 'success' as const,
        }],
      }),
    });
    updateSessions(withTool);
    setSessions(withTool);

    // Stream text token by token
    const words = result.text.split(' ');
    let idx = 0;

    const tick = () => {
      if (idx >= words.length) {
        setIsStreaming(false);
        return;
      }
      const chunk = words.slice(idx, idx + 5).join(' ') + ' ';
      idx += 5;

      setSessions(prev => {
        const updated = prev.map(s => s.id !== sid ? s : {
          ...s,
          messages: s.messages.map(m => m.id !== assistantId ? m : {
            ...m,
            content: m.content + chunk,
          }),
        });
        persist(updated);
        return updated;
      });

      streamTimer.current = setTimeout(tick, 25 + Math.random() * 15);
    };

    tick();
  }, [activeId, sessions, isStreaming, userLocation, updateSessions, onMarineData]);

  const clearMessages = useCallback(() => {
    if (streamTimer.current) clearTimeout(streamTimer.current);
    setIsStreaming(false);
    setSessions(prev => {
      const updated = prev.map(s => s.id !== activeId ? s : {
        ...s, messages: [], updatedAt: new Date().toISOString(),
      });
      persist(updated);
      return updated;
    });
  }, [activeId]);

  const dismissAlert = useCallback((index: number) => {
    setSafetyAlerts(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    sessions,
    activeId,
    activeSession,
    messages,
    isStreaming,
    safetyAlerts,
    userLocation,
    setUserLocation,
    sendMessage,
    newSession,
    switchSession,
    deleteSession,
    renameSession,
    clearMessages,
    dismissAlert,
  };
};
