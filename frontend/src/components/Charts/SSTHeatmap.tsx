import React, { useState } from 'react';

export interface SSTDataPoint {
  lat: number;
  lon: number;
  sst: number;
}

interface SSTHeatmapProps {
  data: SSTDataPoint[];
  title?: string;
}

const getSSTColor = (sst: number) => {
  if (sst < 15) return '#1e3a5f'; // Deep blue
  if (sst < 20) return '#2dd4bf'; // Teal
  if (sst < 25) return '#facc15'; // Warm yellow
  if (sst < 28) return '#fb7185'; // Coral
  return '#ef4444'; // Red
};

export const SSTHeatmap: React.FC<SSTHeatmapProps> = ({ data, title }) => {
  const [hoveredPoint, setHoveredPoint] = useState<SSTDataPoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {title && (
          <h3 style={{
            fontSize: '14px',
            color: 'var(--orca-text-secondary, #94a3b8)',
            margin: '0 0 16px 0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 500
          }}>
            {title}
          </h3>
        )}
        <div style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.04)',
          color: 'var(--orca-text-muted, #64748b)',
          fontFamily: 'ui-monospace, "SF Mono", monospace',
          fontSize: '12px'
        }}>
          No SST data available
        </div>
      </div>
    );
  }

  // Assuming data forms a rectangular grid for simplicity in visualization
  // In real app, we'd calculate grid dimensions from unique lats/lons
  const gridCols = Math.ceil(Math.sqrt(data.length));
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {title && (
        <h3 style={{
          fontSize: '14px',
          color: 'var(--orca-text-secondary, #94a3b8)',
          margin: '0 0 16px 0',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: 500
        }}>
          {title}
        </h3>
      )}

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(' + gridCols + ', 1fr)',
          gap: 0,
          border: '1px solid rgba(255,255,255,0.04)',
          backgroundColor: 'var(--orca-bg-tertiary, #162544)',
          width: 'fit-content'
        }}>
          {data.map((point, i) => (
            <div
              key={i}
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: getSSTColor(point.sst),
                border: '1px solid rgba(255,255,255,0.02)',
                cursor: 'crosshair',
                transition: 'opacity 0.2s',
                opacity: hoveredPoint === point ? 0.8 : 1
              }}
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </div>

        {hoveredPoint && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            backgroundColor: 'var(--orca-bg-surface, #1a2d4a)',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '8px 12px',
            zIndex: 10,
            pointerEvents: 'none',
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: '12px',
            color: 'var(--orca-text-primary, #e2e8f0)',
            whiteSpace: 'nowrap',
            boxShadow: 'none'
          }}>
            <div style={{ color: 'var(--orca-text-muted, #64748b)', marginBottom: '4px' }}>
              Lat: {hoveredPoint.lat.toFixed(2)}, Lon: {hoveredPoint.lon.toFixed(2)}
            </div>
            <div>
              SST: <span style={{ color: getSSTColor(hoveredPoint.sst) }}>{hoveredPoint.sst.toFixed(1)}°C</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: '10px',
        color: 'var(--orca-text-muted, #64748b)'
      }}>
        <span>15°C</span>
        <div style={{ 
          width: '120px', 
          height: '6px', 
          background: 'linear-gradient(to right, #1e3a5f, #2dd4bf, #facc15, #fb7185, #ef4444)',
          borderRadius: '3px'
        }} />
        <span>32°C+</span>
      </div>
    </div>
  );
};
