import { MarineData, TideData, ChatMessage, GeoJSONLayer } from '../types';
import { WaveChartData } from '../components/Charts/WaveChart';
import { SSTDataPoint } from '../components/Charts/SSTHeatmap';

// ── Wave Chart ────────────────────────────────────────────────────────────────
export const mockWaveData: WaveChartData[] = [
  { time: '00:00', waveHeight: 1.2, wavePeriod: 8,  swellHeight: 0.9 },
  { time: '02:00', waveHeight: 1.5, wavePeriod: 9,  swellHeight: 1.1 },
  { time: '04:00', waveHeight: 1.8, wavePeriod: 9,  swellHeight: 1.4 },
  { time: '06:00', waveHeight: 2.3, wavePeriod: 10, swellHeight: 1.8 },
  { time: '08:00', waveHeight: 2.7, wavePeriod: 11, swellHeight: 2.2 },
  { time: '10:00', waveHeight: 3.1, wavePeriod: 12, swellHeight: 2.6 },
  { time: '12:00', waveHeight: 2.9, wavePeriod: 11, swellHeight: 2.4 },
  { time: '14:00', waveHeight: 2.4, wavePeriod: 10, swellHeight: 2.0 },
  { time: '16:00', waveHeight: 2.0, wavePeriod: 9,  swellHeight: 1.7 },
  { time: '18:00', waveHeight: 1.7, wavePeriod: 8,  swellHeight: 1.4 },
  { time: '20:00', waveHeight: 1.4, wavePeriod: 8,  swellHeight: 1.1 },
  { time: '22:00', waveHeight: 1.2, wavePeriod: 7,  swellHeight: 0.9 },
];

// ── Tide Chart ────────────────────────────────────────────────────────────────
export const mockTideData: TideData[] = [
  { time: '00:00', height: 0.4 },
  { time: '01:00', height: 0.8 },
  { time: '02:00', height: 1.4 },
  { time: '03:00', height: 1.9 },
  { time: '04:00', height: 2.3, type: 'high' },
  { time: '05:00', height: 2.1 },
  { time: '06:00', height: 1.6 },
  { time: '07:00', height: 1.0 },
  { time: '08:00', height: 0.5 },
  { time: '09:00', height: 0.2, type: 'low' },
  { time: '10:00', height: 0.4 },
  { time: '11:00', height: 0.9 },
  { time: '12:00', height: 1.5 },
  { time: '13:00', height: 2.0 },
  { time: '14:00', height: 2.4, type: 'high' },
  { time: '15:00', height: 2.2 },
  { time: '16:00', height: 1.7 },
  { time: '17:00', height: 1.1 },
  { time: '18:00', height: 0.6 },
  { time: '19:00', height: 0.2, type: 'low' },
  { time: '20:00', height: 0.5 },
  { time: '21:00', height: 1.0 },
  { time: '22:00', height: 1.6 },
  { time: '23:00', height: 2.1 },
];

// ── Marine Data Card ──────────────────────────────────────────────────────────
export const mockMarineData: MarineData = {
  waveHeight: 2.3,
  wavePeriod: 10.5,
  waveDirection: 225,
  swellHeight: 1.8,
  currentSpeed: 0.8,
  currentDirection: 180,
  sst: 27.4,
  salinity: 35.2,
  chlorophyll: 0.42,
  windSpeed: 18.6,
  windDirection: 240,
  visibility: 12.5,
  pressure: 1012,
};

// ── SST Heatmap ───────────────────────────────────────────────────────────────
export const mockSSTData: SSTDataPoint[] = (() => {
  const pts: SSTDataPoint[] = [];
  const baseLat = 8.5;
  const baseLon = 76.5;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 10; c++) {
      // Simulate warmer SST offshore, slightly cooler near coast
      const sst = 25 + Math.sin(r * 0.8) * 3 + Math.cos(c * 0.6) * 2 + (Math.random() * 2 - 1);
      pts.push({ lat: baseLat + r * 0.5, lon: baseLon + c * 0.5, sst: parseFloat(sst.toFixed(1)) });
    }
  }
  return pts;
})();

// ── Data Sparklines ───────────────────────────────────────────────────────────
export const mockSparklineWave   = [1.2, 1.5, 1.8, 2.3, 2.7, 3.1, 2.9, 2.4, 2.0, 1.7];
export const mockSparklineWind   = [12, 15, 18, 22, 25, 28, 24, 20, 17, 14];
export const mockSparklineSST    = [25.1, 25.8, 26.3, 27.1, 27.4, 27.0, 26.6, 26.2, 25.9, 25.5];
export const mockSparklinePres   = [1014, 1013, 1012, 1012, 1011, 1010, 1011, 1012, 1013, 1012];

// ── WindRose Data ─────────────────────────────────────────────────────────────
export const mockWindData = { windSpeed: 18, windDirection: 240, gustSpeed: 26 };

// ── Mock Chat Messages ────────────────────────────────────────────────────────
export const mockInitialMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: "What are the current wave conditions near Mumbai?",
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: `**Current Wave Conditions — Mumbai Offshore (18.93°N, 72.82°E)**

Conditions are **moderate** with wave heights between 2.1–2.7m. Here's the summary:

| Parameter | Value |
|-----------|-------|
| Significant Wave Height | 2.3 m |
| Wave Period | 10.5 s |
| Swell Height | 1.8 m |
| Wind Speed | 18.6 km/h |
| SST | 27.4°C |

⚠️ Wave heights are expected to peak at **3.1m around 10:00 AM** before easing through the afternoon. Mariners should exercise caution during this window.

The 24-hour wave forecast is displayed in the chart panel below.`,
    timestamp: new Date(Date.now() - 115000).toISOString(),
    toolResults: [
      {
        toolName: 'get_wave_data',
        input: { lat: 18.93, lon: 72.82 },
        output: { waveHeight: 2.3, period: 10.5, direction: 225 },
        status: 'success',
      }
    ]
  },
  {
    id: 'msg-3',
    role: 'user',
    content: "Is it safe to go fishing today?",
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: `**Safety Assessment for Coastal Fishing — Today**

Based on current conditions, **moderate caution** is advised:

- 🟡 **Wave height (2.3m)** — Suitable for larger vessels, borderline for small craft
- 🟢 **Wind speed (18.6 km/h)** — Manageable
- 🟢 **Visibility (12.5 km)** — Good
- 🟡 **Morning peak expected** — Avoid heading out between 08:00–12:00

**Recommendation:** Small fishing boats (< 7m) should wait until afternoon when waves ease below 2.0m. Larger vessels can proceed with standard precautions.`,
    timestamp: new Date(Date.now() - 55000).toISOString(),
  },
];

// ── Mock GeoJSON Layers ───────────────────────────────────────────────────────
export const mockLayers: GeoJSONLayer[] = [
  {
    id: 'pfz-layer',
    type: 'pfz',
    visible: true,
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'PFZ Zone A', confidence: 'High' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[72.5, 18.2], [73.2, 18.2], [73.2, 18.8], [72.5, 18.8], [72.5, 18.2]]]
          }
        },
        {
          type: 'Feature',
          properties: { name: 'PFZ Zone B', confidence: 'Medium' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[73.5, 17.5], [74.1, 17.5], [74.1, 18.0], [73.5, 18.0], [73.5, 17.5]]]
          }
        }
      ]
    }
  },
  {
    id: 'vessel-layer',
    type: 'vessel',
    visible: false,
    data: {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { name: 'MV Ocean Star', speed: 12 }, geometry: { type: 'Point', coordinates: [72.8, 18.6] } },
        { type: 'Feature', properties: { name: 'FV Sagar Mitra', speed: 8  }, geometry: { type: 'Point', coordinates: [73.1, 17.9] } },
        { type: 'Feature', properties: { name: 'MV Coastal Wind', speed: 15 }, geometry: { type: 'Point', coordinates: [74.0, 17.7] } },
      ]
    }
  },
  {
    id: 'sst-layer',
    type: 'sst',
    visible: false,
    data: {
      type: 'FeatureCollection',
      features: mockSSTData.map(p => ({
        type: 'Feature' as const,
        properties: { temp: p.sst },
        geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] }
      }))
    }
  }
];
