import React from 'react';

interface Zone {
  id: string;
  name: string;
  confidence: 'High' | 'Medium' | 'Low';
  lat: [number, number];
  lon: [number, number];
  species?: string;
}

const MOCK_ZONES: Zone[] = [
  { id: 'pfz-a', name: 'Zone Alpha',  confidence: 'High',   lat: [18.2, 18.8], lon: [72.5, 73.2], species: 'Tuna, Mackerel' },
  { id: 'pfz-b', name: 'Zone Beta',   confidence: 'Medium', lat: [17.5, 18.0], lon: [73.5, 74.1], species: 'Sardine' },
  { id: 'pfz-c', name: 'Zone Gamma',  confidence: 'High',   lat: [16.0, 16.8], lon: [74.0, 75.0], species: 'Pomfret, Tuna' },
  { id: 'pfz-d', name: 'Zone Delta',  confidence: 'Low',    lat: [15.0, 15.5], lon: [73.8, 74.5], species: 'Mixed pelagic' },
];

function confColor(c: Zone['confidence']): string {
  if (c === 'High')   return 'var(--orca-success)';
  if (c === 'Medium') return 'var(--orca-warning)';
  return 'var(--orca-text-muted)';
}

interface FishingZonePanelProps {
  onZoneSelect?: (zone: Zone) => void;
}

export const FishingZonePanel: React.FC<FishingZonePanelProps> = ({ onZoneSelect }) => {
  return (
    <div style={{
      backgroundColor: 'rgba(10,22,40,0.96)',
      border: '1px solid rgba(255,255,255,0.08)',
      fontFamily: 'system-ui, sans-serif',
      width: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 9, color: 'var(--orca-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'ui-monospace, monospace' }}>
            PFZ Advisory
          </div>
          <div style={{ fontSize: 11, color: 'var(--orca-text-secondary)', marginTop: 1 }}>
            Potential Fishing Zones
          </div>
        </div>
        <div style={{
          fontSize: 9,
          padding: '2px 6px',
          border: '1px solid rgba(45,212,191,0.3)',
          color: 'var(--orca-accent)',
          fontFamily: 'ui-monospace, monospace',
        }}>
          MOCK
        </div>
      </div>

      {/* Zone list */}
      <div style={{ padding: '6px' }}>
        {MOCK_ZONES.map((zone, i) => (
          <button
            key={zone.id}
            onClick={() => onZoneSelect?.(zone)}
            className="anim-slide-up"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '9px 10px',
              marginBottom: 4,
              background: 'none',
              border: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'left',
              cursor: 'pointer',
              animationDelay: i * 60 + 'ms',
              animationFillMode: 'both',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(45,212,191,0.3)';
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(45,212,191,0.04)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
          >
            {/* Confidence indicator */}
            <div style={{
              width: 3,
              alignSelf: 'stretch',
              backgroundColor: confColor(zone.confidence),
              flexShrink: 0,
              marginTop: 2,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--orca-text-primary)' }}>{zone.name}</span>
                <span style={{ fontSize: 10, color: confColor(zone.confidence), fontFamily: 'ui-monospace, monospace' }}>
                  {zone.confidence}
                </span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--orca-text-muted)', fontFamily: 'ui-monospace, monospace', marginTop: 3 }}>
                {zone.lat[0].toFixed(1)}-{zone.lat[1].toFixed(1)}N · {zone.lon[0].toFixed(1)}-{zone.lon[1].toFixed(1)}E
              </div>
              {zone.species && (
                <div style={{ fontSize: 10, color: 'var(--orca-text-secondary)', marginTop: 2 }}>
                  {zone.species}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div style={{
        padding: '6px 12px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        fontSize: 9,
        color: 'var(--orca-text-muted)',
        fontFamily: 'ui-monospace, monospace',
      }}>
        Source: INCOIS PFZ Advisory (mock data) · Updated daily
      </div>
    </div>
  );
};

export default FishingZonePanel;
