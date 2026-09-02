// ORCA — Smart query processor
// Extracts location, fetches live marine/weather data, formats response.

import { geocode } from './geocoder';
import { fetchMarineSnapshot, MarineSnapshot } from './openMeteo';
import { MarineData, SafetyAlert } from '../types';
import type { WaveChartData } from '../components/Charts/WaveChart';

export type QueryIntent = 'wave' | 'tide' | 'fishing' | 'safety' | 'sst' | 'wind' | 'general';

export interface OrcaQueryResult {
  text: string;
  intent: QueryIntent;
  marineData?: MarineData;
  waveChartData?: WaveChartData[];
  safetyAlerts?: SafetyAlert[];
  locationName?: string;
  locationCoords?: { lat: number; lon: number };
  toolsUsed: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function compassDir(deg: number): string {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function fmt(n: number, d = 1): string {
  return n.toFixed(d);
}

function assessSafety(snap: MarineSnapshot): { level: SafetyAlert['level']; headline: string; body: string } {
  const wave = snap.current.waveHeight;
  const wind = snap.currentWeather.windSpeed;
  const gust = snap.currentWeather.gustSpeed;

  if (wave >= 4.5 || wind >= 60 || gust >= 80) {
    return {
      level: 'danger',
      headline: 'Severe Sea Conditions',
      body: `Wave height ${fmt(wave)}m, wind ${fmt(wind)} km/h. All small vessels advised to remain in port.`,
    };
  }
  if (wave >= 2.5 || wind >= 35 || gust >= 50) {
    return {
      level: 'warning',
      headline: 'Small Craft Advisory',
      body: `Wave height ${fmt(wave)}m, wind ${fmt(wind)} km/h (gusts ${fmt(gust)} km/h). Exercise caution.`,
    };
  }
  return {
    level: 'info',
    headline: 'Conditions Favorable',
    body: `Wave height ${fmt(wave)}m, wind ${fmt(wind)} km/h. Suitable for most coastal operations.`,
  };
}

// ─── Location extraction ──────────────────────────────────────────────────────

export function extractLocation(query: string): string | null {
  // Match "near X", "off X coast", "at X", "in X waters", "from X"
  const patterns = [
    /near\s+([A-Za-z\s]{3,30}?)(?:\?|$|\s+coast|\s+shore|\s+bay|\s+port|\s+harbour|\s+sea|\s+waters?|\s+tomorrow|\s+today)/i,
    /off\s+(?:the\s+)?([A-Za-z\s]{3,25}?)(?:\s+coast|\s+shore|\s+waters?)/i,
    /(?:at|from|around)\s+([A-Za-z\s]{3,25}?)(?:\?|$|\s+port|\s+harbour)/i,
    /([A-Za-z\s]{3,25}?)\s+(?:coast|bay|harbour|port|waters?|offshore)/i,
  ];

  const skipWords = new Set(['the','me','my','current','safe','nearest','best','good','today',
    'tomorrow','now','what','where','how','is','it','are','sea','ocean']);

  for (const pat of patterns) {
    const m = query.match(pat);
    if (m?.[1]) {
      const loc = m[1].trim().replace(/\s+/g, ' ');
      if (loc.length >= 3 && !skipWords.has(loc.toLowerCase())) return loc;
    }
  }
  return null;
}

export function detectIntent(query: string): QueryIntent {
  const q = query.toLowerCase();
  if (/\b(wave|swell|surf|sea state|height|period)\b/.test(q)) return 'wave';
  if (/\b(tide|tidal|high water|low water|water level|tides)\b/.test(q)) return 'tide';
  if (/\b(fish|fishing|pfz|potential fishing|catch|trawl|net|squid|mackerel)\b/.test(q)) return 'fishing';
  if (/\b(safe|danger|risk|advisory|warning|caution|venture|sail|navigate|go out)\b/.test(q)) return 'safety';
  if (/\b(sst|sea surface temp|temperature|warm|cold|thermal|chloro)\b/.test(q)) return 'sst';
  if (/\b(wind|gust|breeze|storm|cyclone)\b/.test(q)) return 'wind';
  return 'general';
}

// ─── Response builders ────────────────────────────────────────────────────────

function buildWaveResponse(snap: MarineSnapshot, loc: string): string {
  const c = snap.current;
  const cw = snap.currentWeather;
  const next24 = snap.hourly
    .filter(h => new Date(h.time) >= new Date(snap.fetchedAt))
    .slice(0, 24);
  const peak = next24.reduce((a, b) => (b.waveHeight > a.waveHeight ? b : a), next24[0] ?? c);

  return `**Wave Conditions — ${loc}**

Current readings from Open-Meteo Marine API:

| Parameter | Value |
|-----------|-------|
| Significant Wave Height | ${fmt(c.waveHeight)} m |
| Wave Period | ${fmt(c.wavePeriod, 0)} s |
| Wave Direction | ${fmt(c.waveDirection, 0)}° (${compassDir(c.waveDirection)}) |
| Swell Height | ${fmt(c.swellHeight)} m |
| Swell Period | ${fmt(c.swellPeriod, 0)} s |
| Current Speed | ${fmt(c.currentSpeed, 2)} m/s |
| Sea Surface Temp | ${fmt(c.sst)}°C |
| Wind Speed | ${fmt(cw.windSpeed)} km/h ${compassDir(cw.windDirection)} |

**24-hour peak:** ${fmt(peak.waveHeight)} m at ${peak.time.slice(11, 16)} UTC

Wave chart updated in the data panel below.`;
}

function buildSafetyResponse(snap: MarineSnapshot, loc: string): string {
  const c = snap.current;
  const cw = snap.currentWeather;
  const s = assessSafety(snap);
  const status = s.level === 'danger' ? 'DANGEROUS' : s.level === 'warning' ? 'CAUTION ADVISED' : 'FAVORABLE';

  return `**Marine Safety Assessment — ${loc}**

Overall status: **${status}**

| Parameter | Value | Assessment |
|-----------|-------|-----------|
| Wave Height | ${fmt(c.waveHeight)} m | ${c.waveHeight >= 3 ? 'High' : c.waveHeight >= 2 ? 'Moderate' : 'Low'} |
| Wind Speed | ${fmt(cw.windSpeed)} km/h | ${cw.windSpeed >= 40 ? 'Strong' : cw.windSpeed >= 25 ? 'Moderate' : 'Light'} |
| Gusts | ${fmt(cw.gustSpeed)} km/h | ${cw.gustSpeed >= 50 ? 'Severe' : cw.gustSpeed >= 30 ? 'Strong' : 'Acceptable'} |
| Visibility | ${fmt(cw.visibilityKm)} km | ${cw.visibilityKm < 2 ? 'Poor' : cw.visibilityKm < 5 ? 'Moderate' : 'Good'} |
| Sea Surface Temp | ${fmt(c.sst)}°C | — |
| Atmospheric Pressure | ${Math.round(cw.pressure)} hPa | ${cw.pressure < 1000 ? 'Low (storm risk)' : 'Normal'} |

${s.body}

Monitor VHF Channel 16 for Coast Guard broadcasts. Carry EPIRB and life jackets.`;
}

function buildFishingResponse(snap: MarineSnapshot, loc: string): string {
  const c = snap.current;
  const cw = snap.currentWeather;
  const goodForFishing = c.waveHeight <= 2.0 && cw.windSpeed <= 30 && cw.visibilityKm >= 3;

  return `**Fishing Conditions — ${loc}**

Live marine data from Open-Meteo:

| Metric | Value |
|--------|-------|
| Wave Height | ${fmt(c.waveHeight)} m |
| Wind Speed | ${fmt(cw.windSpeed)} km/h |
| Visibility | ${fmt(cw.visibilityKm)} km |
| SST | ${fmt(c.sst)}°C |
| Current Speed | ${fmt(c.currentSpeed, 2)} m/s |

**Operational assessment:** ${goodForFishing ? 'Conditions suitable for fishing operations.' : 'Conditions marginal — exercise caution.'}

PFZ (Potential Fishing Zone) advisories for Indian coastal waters are issued daily by INCOIS. Zones are shown on the map panel — toggle the PFZ layer. For official daily PFZ bulletins, visit incois.gov.in/portal/pfz.

Temperature gradients visible in the SST heatmap (data panel) indicate likely fish aggregation zones.`;
}

function buildSSTResponse(snap: MarineSnapshot, loc: string): string {
  const c = snap.current;
  const next12 = snap.hourly
    .filter(h => new Date(h.time) >= new Date(snap.fetchedAt))
    .slice(0, 12);
  const temps = next12.map(h => fmt(h.sst)).join(', ');

  return `**Sea Surface Temperature — ${loc}**

Current SST: **${fmt(c.sst)}°C**

12-hour trend: ${temps}°C

Warm pools above 28°C favor pelagic species aggregation. Cold upwelling zones (below 24°C) along the shelf break often mark productive fishing grounds.

The SST heatmap in the data panel shows spatial temperature distribution for the region. Toggle the SST layer on the map for broader coverage.`;
}

function buildWindResponse(snap: MarineSnapshot, loc: string): string {
  const cw = snap.currentWeather;
  const c = snap.current;

  return `**Wind and Sea Conditions — ${loc}**

| Parameter | Value |
|-----------|-------|
| Wind Speed | ${fmt(cw.windSpeed)} km/h |
| Wind Direction | ${fmt(cw.windDirection, 0)}° (${compassDir(cw.windDirection)}) |
| Wind Gusts | ${fmt(cw.gustSpeed)} km/h |
| Atmospheric Pressure | ${Math.round(cw.pressure)} hPa |
| Precipitation | ${fmt(cw.precipitation, 1)} mm/hr |
| Visibility | ${fmt(cw.visibilityKm)} km |
| Wave Height (resultant) | ${fmt(c.waveHeight)} m |

Wind direction arrow on the marine data panel (right side) reflects current values. Data source: Open-Meteo.`;
}

function buildGeneralResponse(snap: MarineSnapshot, loc: string): string {
  const c = snap.current;
  const cw = snap.currentWeather;

  return `**Marine Overview — ${loc}**

Live data retrieved from Open-Meteo Marine and Atmosphere APIs:

| Metric | Value |
|--------|-------|
| Wave Height | ${fmt(c.waveHeight)} m |
| Wave Period | ${fmt(c.wavePeriod, 0)} s |
| Swell Height | ${fmt(c.swellHeight)} m |
| Sea Surface Temp | ${fmt(c.sst)}°C |
| Ocean Current | ${fmt(c.currentSpeed, 2)} m/s |
| Wind Speed | ${fmt(cw.windSpeed)} km/h from ${compassDir(cw.windDirection)} |
| Visibility | ${fmt(cw.visibilityKm)} km |
| Pressure | ${Math.round(cw.pressure)} hPa |

Charts and detailed data are in the panel below. Ask me about waves, tides, fishing zones, safety conditions, or sea temperature.`;
}

function buildTideResponse(loc: string): string {
  return `**Tide Information — ${loc}**

Tide height predictions require harmonic tidal analysis from local gauge stations. The Tides tab in the data panel shows predicted values based on typical tidal patterns for this region.

For precise, authoritative tide tables at Indian ports:
- INCOIS Ocean State Forecast: incois.gov.in
- National Hydrographic Office: hydro.gov.in
- Indian Port Authority published tide tables

For US and global ports, NOAA CO-OPS provides free tide predictions at tidesandcurrents.noaa.gov.

The tide chart in the data panel (Tides tab) shows the 24-hour cycle with high and low water markers.`;
}

// ─── Main processor ───────────────────────────────────────────────────────────

export async function processQuery(
  query: string,
  attachedLocation?: { lat: number; lon: number }
): Promise<OrcaQueryResult> {
  const intent = detectIntent(query);
  const toolsUsed: string[] = [];

  // Step 1: Resolve location
  let coords: { lat: number; lon: number } | null = attachedLocation ?? null;
  let resolvedName: string | null = null;

  if (!coords) {
    const locationStr = extractLocation(query);
    if (locationStr) {
      toolsUsed.push('nominatim_geocode');
      const geo = await geocode(locationStr);
      if (geo) {
        coords = { lat: geo.lat, lon: geo.lon };
        resolvedName = geo.shortName;
      }
    }
  }

  // Default to Mumbai offshore if no location resolved
  if (!coords) {
    coords = { lat: 18.93, lon: 72.82 };
    resolvedName = 'Mumbai Offshore (default)';
  }

  // Step 2: Fetch live marine data
  let snap: MarineSnapshot | null = null;
  try {
    toolsUsed.push('open_meteo_marine');
    toolsUsed.push('open_meteo_weather');
    snap = await fetchMarineSnapshot(coords.lat, coords.lon);
  } catch (e) {
    console.error('Marine API error:', e);
  }

  const loc = resolvedName ?? `${coords.lat.toFixed(2)}N, ${coords.lon.toFixed(2)}E`;

  // Step 3: Build response
  let text: string;
  let marineData: MarineData | undefined;
  let waveChartData: WaveChartData[] | undefined;
  let safetyAlerts: SafetyAlert[] | undefined;

  if (snap) {
    // Build MarineData for cards/charts
    marineData = {
      waveHeight: parseFloat(fmt(snap.current.waveHeight)),
      wavePeriod: parseFloat(fmt(snap.current.wavePeriod)),
      waveDirection: snap.current.waveDirection,
      swellHeight: parseFloat(fmt(snap.current.swellHeight)),
      currentSpeed: parseFloat(fmt(snap.current.currentSpeed, 2)),
      sst: parseFloat(fmt(snap.current.sst)),
      windSpeed: parseFloat(fmt(snap.currentWeather.windSpeed)),
      windDirection: snap.currentWeather.windDirection,
      visibility: parseFloat(fmt(snap.currentWeather.visibilityKm)),
      pressure: Math.round(snap.currentWeather.pressure),
    };

    // Build WaveChartData (next 24h)
    const now = new Date();
    const next24 = snap.hourly.filter(h => {
      const t = new Date(h.time);
      return t >= now && t <= new Date(now.getTime() + 24 * 3600 * 1000);
    });
    waveChartData = next24.map(h => ({
      time: h.time.slice(11, 16),
      waveHeight: parseFloat(fmt(h.waveHeight)),
      wavePeriod: parseFloat(fmt(h.wavePeriod)),
      swellHeight: parseFloat(fmt(h.swellHeight)),
    }));

    // Safety alert if conditions warrant
    const s = assessSafety(snap);
    if (s.level !== 'info' || intent === 'safety') {
      safetyAlerts = [{ level: s.level, title: s.headline, message: s.body }];
    }

    // Response text
    switch (intent) {
      case 'wave':    text = buildWaveResponse(snap, loc);    break;
      case 'safety':  text = buildSafetyResponse(snap, loc);  break;
      case 'fishing': text = buildFishingResponse(snap, loc); break;
      case 'sst':     text = buildSSTResponse(snap, loc);     break;
      case 'wind':    text = buildWindResponse(snap, loc);    break;
      case 'tide':    text = buildTideResponse(loc);          break;
      default:        text = buildGeneralResponse(snap, loc); break;
    }
  } else {
    // API failed — give honest fallback
    text = `**${loc}**\n\nUnable to retrieve live marine data at this time. The Open-Meteo Marine API may be temporarily unavailable or the coordinates fall outside coverage.\n\nThe data panel below shows representative mock data for reference. Please retry in a moment.`;
  }

  return {
    text,
    intent,
    marineData,
    waveChartData,
    safetyAlerts,
    locationName: loc,
    locationCoords: coords,
    toolsUsed,
  };
}
