export const formatCoordinate = (value: number, type: 'lat' | 'lon'): string => {
  const isPositive = value >= 0;
  const suffix = type === 'lat' ? (isPositive ? 'N' : 'S') : (isPositive ? 'E' : 'W');
  return `${Math.abs(value).toFixed(4)}° ${suffix}`;
};

export const formatWaveHeight = (meters: number): string => {
  return `${meters.toFixed(1)} m`;
};

export const formatTemperature = (celsius: number): string => {
  return `${celsius.toFixed(1)}°C`;
};

export const formatWindSpeed = (kmh: number): string => {
  return `${kmh.toFixed(1)} km/h`;
};

export const formatPressure = (hpa: number): string => {
  return `${hpa.toFixed(1)} hPa`;
};

export const formatTimestamp = (iso: string): string => {
  const date = new Date(iso);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

export const degreesToCardinal = (degrees: number): string => {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const val = Math.floor((degrees / 22.5) + 0.5);
  return directions[(val % 16)];
};

export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${(km * 1000).toFixed(0)} m`;
  }
  return `${km.toFixed(1)} km`;
};

export const formatDepth = (meters: number): string => {
  return `${meters.toFixed(1)} m`;
};
