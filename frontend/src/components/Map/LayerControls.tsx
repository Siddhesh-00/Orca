import { useState } from 'react';
import { GeoJSONLayer } from '../../types';

interface LayerControlsProps {
  layers: GeoJSONLayer[];
  onToggleLayer: (layerId: string) => void;
}

const IconWave = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12c2.67 0 4-2 6.67-2s4 2 6.67 2 4-2 6.67-2" />
  </svg>
);

const IconFish = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12c0 0-4-6-10-6S2 12 2 12s4 6 10 6 10-6 10-6z" />
    <circle cx="17" cy="12" r="1" />
  </svg>
);

const IconThermometer = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
  </svg>
);

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconShip = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18l-2 6H5l-2-6z" />
    <path d="M12 2v10" />
    <path d="M8 7h8" />
  </svg>
);

const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function LayerControls({ layers, onToggleLayer }: LayerControlsProps) {
  const [expanded, setExpanded] = useState(true);

  const getIcon = (type: string) => {
    switch(type) {
      case 'wave': return <IconWave />;
      case 'pfz': return <IconFish />;
      case 'sst': return <IconThermometer />;
      case 'current': return <IconArrow />;
      case 'vessel': return <IconShip />;
      default: return <IconEye />;
    }
  };

  return (
    <div style={{
      backgroundColor: 'rgba(15, 29, 50, 0.9)',
      border: '1px solid var(--orca-border)',
      width: '200px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      color: 'var(--orca-text-primary)'
    }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--orca-bg-tertiary)',
          fontSize: '14px',
          fontWeight: 500,
          borderBottom: expanded ? '1px solid var(--orca-border)' : 'none'
        }}
      >
        <span>Layers</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      <div style={{
        maxHeight: expanded ? '300px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out'
      }}>
        <div style={{ padding: '8px' }}>
          {layers.map(layer => (
            <div
              key={layer.id}
              onClick={() => onToggleLayer(layer.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                cursor: 'pointer',
                marginBottom: '4px',
                backgroundColor: layer.visible ? 'var(--orca-bg-surface)' : 'transparent',
                border: `1px solid ${layer.visible ? 'var(--orca-accent)' : 'transparent'}`,
                opacity: layer.visible ? 1 : 0.6,
                fontSize: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: layer.visible ? 'var(--orca-accent)' : 'var(--orca-text-muted)' }}>
                {getIcon(layer.type)}
              </div>
              <div style={{ flex: 1 }}>{layer.id}</div>
              <div style={{ color: layer.visible ? 'var(--orca-text-primary)' : 'var(--orca-text-muted)' }}>
                <IconEye />
              </div>
            </div>
          ))}
          {layers.length === 0 && (
            <div style={{ fontSize: '12px', color: 'var(--orca-text-muted)', textAlign: 'center', padding: '8px' }}>
              No layers available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
