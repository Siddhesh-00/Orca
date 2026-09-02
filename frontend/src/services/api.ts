const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const streamChat = (message: string, threadId: string, location?: { lat: number; lon: number }) => {
  const url = new URL(`${window.location.origin}${BASE_URL}/chat/stream`);
  url.searchParams.append('message', message);
  url.searchParams.append('threadId', threadId);
  if (location) {
    url.searchParams.append('lat', location.lat.toString());
    url.searchParams.append('lon', location.lon.toString());
  }

  // Use EventSource for Server-Sent Events
  const eventSource = new EventSource(url.toString());
  return eventSource;
};

export const createSession = async () => {
  const response = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to create session');
  }
  return response.json();
};

export const getHealth = async () => {
  const response = await fetch(`${BASE_URL}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
};
