import React from 'react';
import { MarineData } from '../../types';

interface MarineDataCardProps {
  data: MarineData;
  title?: string;
  compact?: boolean;
}

const formatVal = (val?: number, decimals = 1): string => {
  if (val === undefined || val === null) return '--';
  return val.toFixed(decimals);
};

const getDirectionCard = (deg?: number): string => {
  if (deg === undefined || deg === null) return '';
  const val = Math.floor((deg / 22.5) + 0.5);
  const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return arr[(val % 16)];
};

const getSSTColor = (sst?: number) => {
  if (!sst) return 'transparent';
  if (sst < 15) return '#1e3a5f';
  if (sst < 20) return '#2dd4bf';
  if (sst < 25) return '#facc15';
  if (sst < 28) return '#fb7185';
  return '#ef4444';
};

export const MarineDataCard: React.FC<MarineDataCardProps> = ({ data, title, compact = false }) => {
  const cols = compact ? 2 : 3;

  return (
    <div style={{
      backgroundColor: 'var(--orca-bg-surface, #1a2d4a)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '4px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    }}>
      <style>
        {`
          @keyframes waveCardAnim {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(2px) translateY(-2px); }
            100% { transform: translateX(0) translateY(0); }
          }
          .wave-icon {
            animation: waveCardAnim 3s ease-in-out infinite;
          }
        `}
      </style>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        {title && (
          <h3 style={{
            fontSize: '14px',
            color: 'var(--orca-text-secondary, #94a3b8)',
            margin: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 500
          }}>
            {title}
          </h3>
        )}
        <svg className="wave-icon" width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="var(--orca-accent, #2dd4bf)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6c2.5 0 2.5-4 5-4s2.5 4 5 4 2.5-4 5-4 2.5 4 5 4" />
        </svg>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: \`repeat(\${cols}, 1fr)\`,
        gap: '20px 16px'
      }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--orca-text-muted, #64748b)', fontFamily: '-apple-system, sans-serif' }}>WAVE HEIGHT</span>
          <div style={{ fontSize: '18px', color: 'var(--orca-text-primary, #e2e8f0)', fontFamily: 'ui-monospace, monospace' }}>
            {formatVal(data.waveHeight)} <span style={{ fontSize: '12px', color: 'var(--orca-text-muted, #64748b)' }}>m</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--orca-text-muted, #64748b)', fontFamily: '-apple-system, sans-serif' }}>WAVE PERIOD</span>
          <div style={{ fontSize: '18px', color: 'var(--orca-text-primary, #e2e8f0)', fontFamily: 'ui-monospace, monospace' }}>
            {formatVal(data.wavePeriod)} <span style={{ fontSize: '12px', color: 'var(--orca-text-muted, #64748b)' }}>s</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--orca-text-muted, #64748b)', fontFamily: '-apple-system, sans-serif' }}>WIND SPEED</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '18px', color: 'var(--orca-text-primary, #e2e8f0)', fontFamily: 'ui-monospace, monospace' }}>
            <span>{formatVal(data.windSpeed)}</span> 
            <span style={{ fontSize: '12px', color: 'var(--orca-text-muted, #64748b)' }}>km/h</span>
            {data.windDirection !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                  style={{ transform: \`rotate(\${data.windDirection}deg)\`, color: 'var(--orca-text-muted, #64748b)' }}>
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
                <span style={{ fontSize: '10px', color: 'var(--orca-text-secondary, #94a3b8)', marginLeft: '4px' }}>{getDirectionCard(data.windDirection)}</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--orca-text-muted, #64748b)', fontFamily: '-apple-system, sans-serif' }}>SST</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '18px', color: 'var(--orca-text-primary, #e2e8f0)', fontFamily: 'ui-monospace, monospace' }}>
            {data.sst !== undefined && (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getSSTColor(data.sst) }} />
            )}
            <span>{formatVal(data.sst)}</span>
            <span style={{ fontSize: '12px', color: 'var(--orca-text-muted, #64748b)' }}>°C</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--orca-text-muted, #64748b)', fontFamily: '-apple-system, sans-serif' }}>CURRENT</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '18px', color: 'var(--orca-text-primary, #e2e8f0)', fontFamily: 'ui-monospace, monospace' }}>
            <span>{formatVal(data.currentSpeed)}</span>
            <span style={{ fontSize: '12px', color: 'var(--orca-text-muted, #64748b)' }}>m/s</span>
            {data.currentDirection !== undefined && (
              <span style={{ fontSize: '10px', color: 'var(--orca-text-secondary, #94a3b8)' }}>{getDirectionCard(data.currentDirection)}</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--orca-text-muted, #64748b)', fontFamily: '-apple-system, sans-serif' }}>VISIBILITY / PRESSURE</span>
          <div style={{ fontSize: '18px', color: 'var(--orca-text-primary, #e2e8f0)', fontFamily: 'ui-monospace, monospace' }}>
            {formatVal(data.visibility)} <span style={{ fontSize: '12px', color: 'var(--orca-text-muted, #64748b)' }}>km</span>
            <span style={{ color: 'var(--orca-text-muted, #64748b)', margin: '0 4px' }}>/</span>
            {formatVal(data.pressure, 0)} <span style={{ fontSize: '12px', color: 'var(--orca-text-muted, #64748b)' }}>hPa</span>
          </div>
        </div>

      </div>
    </div>
  );
};
