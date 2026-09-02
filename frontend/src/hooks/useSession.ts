import { useState, useCallback, useEffect } from 'react';

export const useSession = () => {
  const [threadId, setThreadId] = useState<string>('');
  const [sessionHistory, setSessionHistory] = useState<string[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('threadId');
    if (stored) {
      setThreadId(stored);
    } else {
      const newId = crypto.randomUUID();
      setThreadId(newId);
      sessionStorage.setItem('threadId', newId);
    }

    const history = localStorage.getItem('sessionHistory');
    if (history) {
      try {
        setSessionHistory(JSON.parse(history));
      } catch (e) {}
    }
  }, []);

  const saveSession = useCallback(() => {
    if (threadId) {
      sessionStorage.setItem('threadId', threadId);
      setSessionHistory(prev => {
        const next = Array.from(new Set([...prev, threadId]));
        localStorage.setItem('sessionHistory', JSON.stringify(next));
        return next;
      });
    }
  }, [threadId]);

  const newSession = useCallback(() => {
    const newId = crypto.randomUUID();
    setThreadId(newId);
    sessionStorage.setItem('threadId', newId);
  }, []);

  return {
    threadId,
    newSession,
    saveSession,
    sessionHistory
  };
};
