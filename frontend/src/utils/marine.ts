export interface MarineData {
  waveHeight?: number;
  windSpeedKmh?: number;
  visibilityKm?: number;
}

export interface TideData {
  time: string;
  height: number;
}

export const calculateBeaufortScale = (windSpeedKmh: number): { number: number, description: string } => {
  if (windSpeedKmh < 1) return { number: 0, description: 'Calm' };
  if (windSpeedKmh <= 5) return { number: 1, description: 'Light air' };
  if (windSpeedKmh <= 11) return { number: 2, description: 'Light breeze' };
  if (windSpeedKmh <= 19) return { number: 3, description: 'Gentle breeze' };
  if (windSpeedKmh <= 28) return { number: 4, description: 'Moderate breeze' };
  if (windSpeedKmh <= 38) return { number: 5, description: 'Fresh breeze' };
  if (windSpeedKmh <= 49) return { number: 6, description: 'Strong breeze' };
  if (windSpeedKmh <= 61) return { number: 7, description: 'High wind' };
  if (windSpeedKmh <= 74) return { number: 8, description: 'Gale' };
  if (windSpeedKmh <= 88) return { number: 9, description: 'Strong gale' };
  if (windSpeedKmh <= 102) return { number: 10, description: 'Storm' };
  if (windSpeedKmh <= 117) return { number: 11, description: 'Violent storm' };
  return { number: 12, description: 'Hurricane force' };
};

export const getSeaStateDescription = (waveHeight: number): string => {
  if (waveHeight < 0.1) return 'Calm';
  if (waveHeight < 0.5) return 'Slight';
  if (waveHeight < 1.25) return 'Moderate';
  if (waveHeight < 2.5) return 'Rough';
  if (waveHeight < 4) return 'Very Rough';
  if (waveHeight < 6) return 'High';
  return 'Phenomenal';
};

export const assessSafetyLevel = (data: MarineData): { level: 'safe'|'caution'|'warning'|'danger', factors: string[] } => {
  const factors: string[] = [];
  const wave = data.waveHeight ?? 0;
  const wind = data.windSpeedKmh ?? 0;
  const vis = data.visibilityKm ?? 10;

  if (wave > 4 || wind > 60 || vis < 1) {
    if (wave > 4) factors.push('Dangerous wave height');
    if (wind > 60) factors.push('Dangerous wind speed');
    if (vis < 1) factors.push('Extremely poor visibility');
    return { level: 'danger', factors };
  }
  
  if (wave >= 2 || wind >= 35 || vis <= 2) {
    if (wave >= 2) factors.push('High waves');
    if (wind >= 35) factors.push('Strong winds');
    if (vis <= 2) factors.push('Poor visibility');
    return { level: 'warning', factors };
  }

  if (wave >= 1 || wind >= 20 || vis <= 5) {
    if (wave >= 1) factors.push('Moderate waves');
    if (wind >= 20) factors.push('Moderate winds');
    if (vis <= 5) factors.push('Reduced visibility');
    return { level: 'caution', factors };
  }

  return { level: 'safe', factors: ['Conditions are safe'] };
};

export const getSSTCategory = (celsius: number): { category: 'cold'|'cool'|'warm'|'hot', description: string } => {
  if (celsius < 15) return { category: 'cold', description: 'Cold' };
  if (celsius < 20) return { category: 'cool', description: 'Cool' };
  if (celsius < 28) return { category: 'warm', description: 'Warm' };
  return { category: 'hot', description: 'Hot' };
};

export const getChlorophyllLevel = (mgPerM3: number): 'low'|'moderate'|'high'|'bloom' => {
  if (mgPerM3 < 0.1) return 'low';
  if (mgPerM3 < 1) return 'moderate';
  if (mgPerM3 < 10) return 'high';
  return 'bloom';
};

export const calculateTidalRange = (tideData: TideData[]): { range: number, highest: TideData, lowest: TideData } | null => {
  if (!tideData || tideData.length === 0) return null;
  let highest = tideData[0];
  let lowest = tideData[0];
  
  tideData.forEach(t => {
    if (t.height > highest.height) highest = t;
    if (t.height < lowest.height) lowest = t;
  });
  
  return {
    range: highest.height - lowest.height,
    highest,
    lowest
  };
};
