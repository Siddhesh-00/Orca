import React from 'react';
import { MarineData } from '../../types';

interface WeatherWidgetProps {
  marineData: MarineData;
  locationName?: string;
  isLoading?: boolean;
}

function compassDir(deg?: number): string {
  if (deg == null) return '--';
  const d = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return d[Math.round(deg / 22.5) % 16];
}

function windDesc(speed?: number): string {
  if (speed == null) return 'Calm';
  if (speed < 12)  return 'Calm';
  if (speed < 25)  return 'Light';
  if (speed < 40)  return 'Moderate';
  if (speed < 60)  return 'Strong';
  return 'Storm';
}

function safetyColor(waveH?: number): string {
  if (!waveH) return 'var(--orca-success)';
  if (waveH >= 4) return 'var(--orca-danger)';
  if (waveH >= 2.5) return 'var(--orca-warning)';
  return 'var(--orca-success)';
}

function safetyLabel(waveH?: number): string {
  if (!waveH) return 'Favorable';
  if (waveH >= 4) return 'Dangerous';
  if (waveH >= 2.5) return 'Caution';
  return 'Favorable';
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  }}>
    <span style={{ fontSize: 10, color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </span>
    <span style={{ fontSize: 11, color: 'var(--orca-text-primary)', fontFamily: 'ui-monospace, monospace' }}>
      {value}
    </span>
  </div>
);

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ marineData, locationName, isLoading }) => {
  const color = safetyColor(marineData.waveHeight);
  const label = safetyLabel(marineData.waveHeight);

  return (
    <div
      className="anim-slide-up"
      style={{
        backgroundColor: 'rgba(10,22,40,0.94)',
        border: '1px solid rgba(255,255,255,0.08)',
        width: 220,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 9, color: 'var(--orca-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'ui-monospace, monospace' }}>
            Live Conditions
          </div>
          {locationName && (
            <div style={{ fontSize: 11, color: 'var(--orca-text-secondary)', marginTop: 2, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {locationName}
            </div>
          )}
        </div>
        {/* Status badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 7px',
          border: '1px solid ' + color,
          backgroundColor: color + '18',
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: color, animation: 'pulse-subtle 2s infinite' }} />
          <span style={{ fontSize: 9, color, fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </span>
        </div>
      </div>

      {/* Big wave height */}
      <div style={{
        padding: '12px',
        display: 'flex',
        gap: 16,
        alignItems: 'flex-end',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div>
          <div style={{ fontSize: 9, color: 'var(--orca-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'ui-monospace, monospace' }}>Wave Ht</div>
          <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--orca-accent)', fontFamily: 'ui-monospace, monospace', lineHeight: 1.1 }}>
            {isLoading ? '--.-' : (marineData.waveHeight?.toFixed(1) ?? '--')}
            <span style={{ fontSize: 12, color: 'var(--orca-text-muted)', fontWeight: 400, marginLeft: 3 }}>m</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: 'var(--orca-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'ui-monospace, monospace' }}>SST</div>
          <div style={{ fontSize: 20, color: '#fb7185', fontFamily: 'ui-monospace, monospace', lineHeight: 1.1 }}>
            {marineData.sst?.toFixed(1) ?? '--'}
            <span style={{ fontSize: 11, color: 'var(--orca-text-muted)', marginLeft: 2 }}>°C</span>
          </div>
        </div>
      </div>

      {/* Data rows */}
      <div style={{ padding: '4px 12px 10px' }}>
        <Row label="Wind"    value={(marineData.windSpeed?.toFixed(0) ?? '--') + ' km/h ' + compassDir(marineData.windDirection) + ' (' + windDesc(marineData.windSpeed) + ')'} />
        <Row label="Swell"   value={(marineData.swellHeight?.toFixed(1) ?? '--') + ' m'} />
        <Row label="Period"  value={(marineData.wavePeriod?.toFixed(0) ?? '--') + ' s'} />
        <Row label="Current" value={(marineData.currentSpeed?.toFixed(2) ?? '--') + ' m/s'} />
        <Row label="Vis"     value={(marineData.visibility?.toFixed(1) ?? '--') + ' km'} />
        <Row label="Press"   value={(marineData.pressure != null ? String(marineData.pressure) : '--') + ' hPa'} />
      </div>

      <div style={{
        padding: '5px 12px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontSize: 9,
        color: 'var(--orca-text-muted)',
        fontFamily: 'ui-monospace, monospace',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>Open-Meteo Marine</span>
        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};

export default WeatherWidget;
