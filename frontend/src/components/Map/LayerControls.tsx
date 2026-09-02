import { useState } from 'react';
import { GeoJSONLayer } from '../../types';

interface LayerControlsProps {
  layers: GeoJSONLayer[];
  onToggleLayer: (layerId: string) => void;
}

const IconFish = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12c0 0-4-6-10-6S2 12 2 12s4 6 10 6 10-6 10-6z" />
    <circle cx="17" cy="12" r="1" />
  </svg>
);

const IconTherm = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
  </svg>
);

const IconShip = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18l-2 6H5l-2-6z" />
    <path d="M12 2v10M8 7h8" />
  </svg>
);

const IconWave = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12c2.67 0 4-2 6.67-2s4 2 6.67 2 4-2 6.67-2" />
  </svg>
);

const IconLayer = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const IconChevron = ({ up }: { up: boolean }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d={up ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
  </svg>
);

function getIcon(type: GeoJSONLayer['type']) {
  switch (type) {
    case 'pfz': return <IconFish />;
    case 'sst': return <IconTherm />;
    case 'vessel': return <IconShip />;
    case 'wave': return <IconWave />;
    default: return <IconLayer />;
  }
}

export default function LayerControls({ layers, onToggleLayer }: LayerControlsProps) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{
      backgroundColor: 'rgba(10, 22, 40, 0.92)',
      border: '1px solid rgba(255,255,255,0.08)',
      width: '192px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'var(--orca-text-primary)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          background: 'none',
          border: 'none',
          color: 'var(--orca-text-secondary)',
          cursor: 'pointer',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontFamily: 'ui-monospace, monospace',
          borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <span>Map Layers</span>
        <IconChevron up={open} />
      </button>

      {open && (
        <div style={{ padding: '6px' }}>
          {layers.length === 0 && (
            <div style={{
              fontSize: '11px',
              color: 'var(--orca-text-muted)',
              padding: '8px',
              textAlign: 'center',
              fontFamily: 'ui-monospace, monospace',
            }}>
              No layers
            </div>
          )}
          {layers.map(layer => (
            <button
              key={layer.id}
              onClick={() => onToggleLayer(layer.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 8px',
                marginBottom: 2,
                background: 'none',
                border: `1px solid ${layer.visible ? 'rgba(45,212,191,0.3)' : 'rgba(255,255,255,0.04)'}`,
                backgroundColor: layer.visible ? 'rgba(45,212,191,0.06)' : 'transparent',
                color: layer.visible ? 'var(--orca-accent)' : 'var(--orca-text-muted)',
                cursor: 'pointer',
                fontSize: '12px',
                textAlign: 'left',
              }}
            >
              <span style={{ flexShrink: 0 }}>{getIcon(layer.type)}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {layer.label || layer.id}
              </span>
              {/* Toggle indicator */}
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: layer.visible ? 'var(--orca-accent)' : 'rgba(255,255,255,0.15)',
                flexShrink: 0,
              }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
