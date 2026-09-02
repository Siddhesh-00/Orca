export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolResults?: ToolResult[];
}

export interface ToolResult {
  toolName: string;
  input: any;
  output: any;
  status: 'loading' | 'success' | 'error';
  geojson?: GeoJSON.FeatureCollection;
}

export interface SSEEvent {
  type: 'token' | 'tool_start' | 'tool_end' | 'geojson' | 'safety_alert' | 'done';
  payload: any;
}

export interface MarineData {
  waveHeight?: number;
  wavePeriod?: number;
  waveDirection?: number;
  swellHeight?: number;
  currentSpeed?: number;
  currentDirection?: number;
  sst?: number;
  salinity?: number;
  chlorophyll?: number;
  windSpeed?: number;
  windDirection?: number;
  visibility?: number;
  pressure?: number;
}

export interface TideData {
  time: string;
  height: number;
  type?: 'high' | 'low';
}

export interface SafetyAlert {
  level: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  parameters?: Record<string, any>;
}

export interface MapViewport {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface GeoJSONLayer {
  id: string;
  data: any;
  type: 'pfz' | 'sst' | 'current' | 'wave' | 'vessel' | 'custom';
  visible: boolean;
}

export interface SessionState {
  threadId: string;
  messages: ChatMessage[];
  layers: GeoJSONLayer[];
  viewport: MapViewport;
  safetyAlerts: SafetyAlert[];
}
