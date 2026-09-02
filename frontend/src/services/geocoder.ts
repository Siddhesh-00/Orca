// Nominatim geocoder — free, no key, open OSM data
// https://nominatim.openstreetmap.org

export interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;
  shortName: string;
  type: string;
  importance: number;
}

export async function geocode(query: string): Promise<GeoResult | null> {
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '5',
      'accept-language': 'en',
    });

    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': 'ORCA-MarineIntelligence/1.0 (educational project)' },
    });

    if (!res.ok) return null;
    const results: any[] = await res.json();
    if (!results.length) return null;

    // Prefer coastal / water features; fall back to highest-importance result
    const preferred =
      results.find(r =>
        ['sea', 'ocean', 'bay', 'harbour', 'port', 'water', 'cape', 'peninsula'].includes(r.type)
      ) ??
      results.sort((a, b) => b.importance - a.importance)[0];

    const parts = preferred.display_name.split(',');
    const shortName = parts.slice(0, 2).join(',').trim();

    return {
      lat: parseFloat(preferred.lat),
      lon: parseFloat(preferred.lon),
      displayName: preferred.display_name,
      shortName,
      type: preferred.type ?? 'place',
      importance: preferred.importance ?? 0,
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&format=json`,
      { headers: { 'User-Agent': 'ORCA-MarineIntelligence/1.0' } }
    );
    if (!res.ok) return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
    const data = await res.json();
    const parts = (data.display_name ?? '').split(',');
    return parts.slice(0, 3).join(',').trim() || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  } catch {
    return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  }
}
