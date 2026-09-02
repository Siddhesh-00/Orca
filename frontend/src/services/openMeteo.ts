// Open-Meteo Marine API — free, no key, CORS-enabled
// https://open-meteo.com/en/docs/marine-weather-api
// https://api.open-meteo.com (atmosphere)

export interface MarinePoint {
  time: string;
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  swellHeight: number;
  swellPeriod: number;
  currentSpeed: number;
  sst: number;
}

export interface WeatherPoint {
  time: string;
  windSpeed: number;
  windDirection: number;
  gustSpeed: number;
  pressure: number;
  visibilityKm: number;
  precipitation: number;
}

export interface MarineSnapshot {
  location: { lat: number; lon: number };
  current: MarinePoint;
  currentWeather: WeatherPoint;
  hourly: MarinePoint[];
  hourlyWeather: WeatherPoint[];
  fetchedAt: string;
}

export async function fetchMarineSnapshot(lat: number, lon: number): Promise<MarineSnapshot> {
  const marineParams = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    hourly: [
      'wave_height',
      'wave_direction',
      'wave_period',
      'swell_wave_height',
      'swell_wave_period',
      'ocean_current_velocity',
      'sea_surface_temperature',
    ].join(','),
    timezone: 'auto',
    forecast_days: '3',
  });

  const weatherParams = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    hourly: [
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'surface_pressure',
      'visibility',
      'precipitation',
    ].join(','),
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: '3',
  });

  const [marineRes, weatherRes] = await Promise.all([
    fetch(`https://marine-api.open-meteo.com/v1/marine?${marineParams}`),
    fetch(`https://api.open-meteo.com/v1/forecast?${weatherParams}`),
  ]);

  if (!marineRes.ok) throw new Error(`Marine API ${marineRes.status}`);
  if (!weatherRes.ok) throw new Error(`Weather API ${weatherRes.status}`);

  const [m, w] = await Promise.all([marineRes.json(), weatherRes.json()]);

  const hourly: MarinePoint[] = (m.hourly.time as string[]).map((t, i) => ({
    time: t,
    waveHeight: m.hourly.wave_height?.[i] ?? 0,
    wavePeriod: m.hourly.wave_period?.[i] ?? 0,
    waveDirection: m.hourly.wave_direction?.[i] ?? 0,
    swellHeight: m.hourly.swell_wave_height?.[i] ?? 0,
    swellPeriod: m.hourly.swell_wave_period?.[i] ?? 0,
    currentSpeed: m.hourly.ocean_current_velocity?.[i] ?? 0,
    sst: m.hourly.sea_surface_temperature?.[i] ?? 0,
  }));

  const hourlyWeather: WeatherPoint[] = (w.hourly.time as string[]).map((t, i) => ({
    time: t,
    windSpeed: w.hourly.wind_speed_10m?.[i] ?? 0,
    windDirection: w.hourly.wind_direction_10m?.[i] ?? 0,
    gustSpeed: w.hourly.wind_gusts_10m?.[i] ?? 0,
    pressure: w.hourly.surface_pressure?.[i] ?? 1013,
    visibilityKm: ((w.hourly.visibility?.[i] ?? 10000) / 1000),
    precipitation: w.hourly.precipitation?.[i] ?? 0,
  }));

  // Find index closest to current time
  const nowStr = new Date().toISOString().slice(0, 13);
  const currentIdx = Math.max(0, hourly.findIndex(h => h.time.slice(0, 13) >= nowStr));
  const currentWIdx = Math.max(0, hourlyWeather.findIndex(h => h.time.slice(0, 13) >= nowStr));

  return {
    location: { lat, lon },
    current: hourly[currentIdx] ?? hourly[0],
    currentWeather: hourlyWeather[currentWIdx] ?? hourlyWeather[0],
    hourly,
    hourlyWeather,
    fetchedAt: new Date().toISOString(),
  };
}
