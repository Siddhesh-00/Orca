import { useState, useCallback, useRef } from 'react';
import { ChatMessage, SafetyAlert } from '../types';
import { mockInitialMessages } from '../data/mockData';

// Canned responses for demo mode
const mockResponses: Record<string, string> = {
  default: `I'm ORCA, your Marine Ecosystem Intelligence assistant. I can help you with:

- 🌊 **Wave & swell forecasts** for Indian coastal waters
- 🎣 **Potential Fishing Zones (PFZ)** and productivity maps
- 🌡️ **Sea Surface Temperature (SST)** analysis
- ⚓ **Safety advisories** for mariners and fishermen
- 🌊 **Tide schedules** for major ports

*Currently running in demo mode with mock data. Connect the backend to enable live satellite data and AI analysis.*`,

  wave: `**Wave Forecast — Arabian Sea (18.93°N, 72.82°E)**

Conditions are **moderate with a rising trend** through the morning:

| Time | Wave Height | Period | Direction |
|------|-------------|--------|-----------|
| 06:00 | 1.8m | 9s | SW |
| 10:00 | **3.1m** | 12s | SW |
| 14:00 | 2.4m | 10s | WSW |
| 18:00 | 1.7m | 8s | W |

⚠️ **Peak warning 08:00–12:00** — Heights exceeding the 3m danger threshold. Small craft advisory in effect.`,

  fishing: `**Potential Fishing Zone (PFZ) Advisory — Today**

Based on satellite chlorophyll and SST gradients:

🟢 **Zone A (High Confidence):** 18.2°N–18.8°N, 72.5°E–73.2°E
- Chlorophyll: 0.85 mg/m³ (elevated)
- SST gradient: 1.2°C/10km
- Estimated density: High

🟡 **Zone B (Moderate):** 17.5°N–18.0°N, 73.5°E–74.1°E
- Chlorophyll: 0.52 mg/m³
- Best access window: 14:00–18:00

PFZ zones are visible on the map panel. Toggle the **PFZ layer** to explore.`,

  tide: `**Tide Schedule — Mumbai (JNPT)**

| Time | Height | Type |
|------|--------|------|
| 04:12 | **2.3m** | 🔺 High |
| 09:48 | 0.2m | 🔻 Low |
| 14:30 | **2.4m** | 🔺 High |
| 20:05 | 0.2m | 🔻 Low |

*Chart data loaded in the Tide panel below.*`,

  safety: `**Marine Safety Assessment — Current Conditions**

Overall Status: 🟡 **MODERATE CAUTION**

| Parameter | Value | Status |
|-----------|-------|--------|
| Wave Height | 2.3m | 🟡 Moderate |
| Wind Speed | 18.6 km/h | 🟢 Good |
| Visibility | 12.5 km | 🟢 Good |
| Swell Height | 1.8m | 🟡 Moderate |

**Recommendations:**
- Small boats (< 7m): Wait until afternoon when waves ease below 2.0m
- Medium vessels: Proceed with caution, monitor VHF Ch. 16
- Large vessels: Normal operations, maintain watch`,

  sst: `**Sea Surface Temperature Analysis — West Coast India**

Current SST range: **25.1°C – 28.6°C**

- 🔵 Cooler upwelling zone detected off Goa (25.1°C)
- 🔴 Warm pool north of Mumbai (27.4–28.6°C)
- Temperature gradient indicates active **thermocline at ~40m depth**

The SST heatmap is displayed in the chart panel. Toggle the **SST layer** on the map to see spatial distribution.`,
};

function getMockResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('wave') || lower.includes('swell')) return mockResponses.wave;
  if (lower.includes('fish') || lower.includes('pfz') || lower.includes('zone')) return mockResponses.fishing;
  if (lower.includes('tide')) return mockResponses.tide;
  if (lower.includes('safe') || lower.includes('sail') || lower.includes('advisory')) return mockResponses.safety;
  if (lower.includes('sst') || lower.includes('temperature')) return mockResponses.sst;
  return mockResponses.default;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(mockInitialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | undefined>();
  const streamRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendMessage = useCallback((content: string) => {
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
      toolResults: [],
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    // Simulate tool call
    setTimeout(() => {
      setMessages(prev => {
        const msgs = [...prev];
        const last = msgs[msgs.length - 1];
        if (last.id !== assistantId) return prev;
        return [
          ...msgs.slice(0, -1),
          {
            ...last,
            toolResults: [{
              toolName: 'marine_data_query',
              input: { query: content, location: userLocation },
              output: null,
              status: 'loading' as const,
            }],
          },
        ];
      });
    }, 400);

    // Resolve tool call
    setTimeout(() => {
      setMessages(prev => {
        const msgs = [...prev];
        const last = msgs[msgs.length - 1];
        if (last.id !== assistantId) return prev;
        return [
          ...msgs.slice(0, -1),
          {
            ...last,
            toolResults: [{
              toolName: 'marine_data_query',
              input: { query: content },
              output: { status: 'ok', source: 'mock' },
              status: 'success' as const,
            }],
          },
        ];
      });
    }, 1200);

    // Stream response token by token
    const fullResponse = getMockResponse(content);
    const words = fullResponse.split(' ');
    let idx = 0;

    const streamNext = () => {
      if (idx >= words.length) {
        setIsStreaming(false);
        // Occasionally add a safety alert for demo
        if (content.toLowerCase().includes('wave') || content.toLowerCase().includes('safe')) {
          setSafetyAlerts(prev => {
            if (prev.length > 0) return prev; // don't stack
            return [{
              level: 'warning',
              title: 'Elevated Wave Heights',
              message: 'Wave heights forecast to exceed 3m between 08:00–12:00. Small craft advisory in effect for Mumbai offshore zone.',
            }];
          });
        }
        return;
      }

      const chunk = words.slice(idx, idx + 3).join(' ') + ' ';
      idx += 3;

      setMessages(prev => {
        const msgs = [...prev];
        const last = msgs[msgs.length - 1];
        if (last.id !== assistantId) return prev;
        return [...msgs.slice(0, -1), { ...last, content: last.content + chunk }];
      });

      streamRef.current = setTimeout(streamNext, 40 + Math.random() * 30);
    };

    // Start streaming after tool resolves
    setTimeout(streamNext, 1400);
  }, [userLocation]);

  const clearMessages = useCallback(() => {
    if (streamRef.current) clearTimeout(streamRef.current);
    setMessages([]);
    setIsStreaming(false);
  }, []);

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
    threadId: 'mock-thread',
    userLocation,
    setUserLocation,
  };
};
