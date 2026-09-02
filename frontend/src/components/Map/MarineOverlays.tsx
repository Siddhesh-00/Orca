import { MarineData } from '../../types';

interface MarineOverlaysProps {
  activeLayers: string[];
  marineData?: MarineData;
}

function compassDir(deg?: number): string {
  if (deg === undefined) return '--';
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Compact live-data readout shown in the bottom-right of the map
export default function MarineOverlays({ activeLayers: _activeLayers, marineData }: MarineOverlaysProps) {
  if (!marineData) return null;

  const rows: [string, string][] = [
    ['WAVE', marineData.waveHeight !== undefined ? marineData.waveHeight.toFixed(1) + ' m' : '--'],
    ['PERIOD', marineData.wavePeriod !== undefined ? marineData.wavePeriod.toFixed(0) + ' s' : '--'],
    ['SWELL', marineData.swellHeight !== undefined ? marineData.swellHeight.toFixed(1) + ' m' : '--'],
    ['WIND', marineData.windSpeed !== undefined ? marineData.windSpeed.toFixed(0) + ' km/h ' + compassDir(marineData.windDirection) : '--'],
    ['SST', marineData.sst !== undefined ? marineData.sst.toFixed(1) + ' °C' : '--'],
    ['PRESS', marineData.pressure !== undefined ? marineData.pressure + ' hPa' : '--'],
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: 36,
      right: 10,
      zIndex: 10,
      backgroundColor: 'rgba(10, 22, 40, 0.90)',
      border: '1px solid rgba(255,255,255,0.08)',
      fontFamily: 'ui-monospace, "SF Mono", monospace',
      fontSize: '10px',
    }}>
      <div style={{
        padding: '4px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        color: 'var(--orca-accent)',
        letterSpacing: '0.08em',
        fontSize: '9px',
      }}>
        LIVE CONDITIONS
      </div>
      <div style={{ padding: '4px 0' }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            padding: '2px 8px',
          }}>
            <span style={{ color: 'var(--orca-text-muted)' }}>{label}</span>
            <span style={{ color: 'var(--orca-text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
