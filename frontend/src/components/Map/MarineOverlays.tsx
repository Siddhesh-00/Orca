import React from 'react';
import { MarineData } from '../../types';

interface MarineOverlaysProps {
  activeLayers: string[];
  marineData?: MarineData;
}

export default function MarineOverlays({ activeLayers, marineData }: MarineOverlaysProps) {
  const showWave = activeLayers.includes('wave');
  const showSst = activeLayers.includes('sst');
  const showCurrent = activeLayers.includes('current');

  return (
    <div style={{
      position: 'absolute',
      bottom: '40px',
      right: '10px',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {showWave && (
        <div style={{
          backgroundColor: 'rgba(26, 45, 74, 0.8)',
          border: '1px solid var(--orca-border)',
          padding: '8px',
          width: '120px'
        }}>
          <div style={{ fontSize: '10px', color: 'var(--orca-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Wave Height (m)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: '6m+', color: '#ef4444' },
              { label: '4m', color: '#f59e0b' },
              { label: '2m', color: '#2dd4bf' },
              { label: '0m', color: '#3b82f6' }
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: item.color }} />
                <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--orca-text-secondary)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSst && (
        <div style={{
          backgroundColor: 'rgba(26, 45, 74, 0.8)',
          border: '1px solid var(--orca-border)',
          padding: '8px',
          width: '120px'
        }}>
          <div style={{ fontSize: '10px', color: 'var(--orca-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Sea Surface Temp
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { label: '35°C', color: '#ef4444' },
              { label: '30°C', color: '#f87171' },
              { label: '20°C', color: '#2dd4bf' },
              { label: '15°C', color: '#1e3a8a' }
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: item.color }} />
                <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--orca-text-secondary)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCurrent && (
        <div style={{
          backgroundColor: 'rgba(26, 45, 74, 0.8)',
          border: '1px solid var(--orca-border)',
          padding: '8px',
          width: '120px'
        }}>
          <div style={{ fontSize: '10px', color: 'var(--orca-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
            Ocean Current
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--orca-text-secondary)' }}>Direction</div>
          </div>
        </div>
      )}
    </div>
  );
}
