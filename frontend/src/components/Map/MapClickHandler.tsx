import { useState, useEffect } from 'react';
import { useMap, Popup, Marker } from 'react-map-gl/maplibre';

interface MapClickHandlerProps {
  onLocationSelect?: (lat: number, lon: number) => void;
}

export default function MapClickHandler({ onLocationSelect }: MapClickHandlerProps) {
  const { current: map } = useMap();
  const [clickPos, setClickPos] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!map) return;
    
    const clickHandler = (e: any) => {
      if (e.defaultPrevented) return;
      setClickPos({ lat: e.lngLat.lat, lon: e.lngLat.lng });
    };

    map.on('click', clickHandler);
    return () => {
      map.off('click', clickHandler);
    };
  }, [map]);

  if (!clickPos) return null;

  return (
    <>
      <Marker longitude={clickPos.lon} latitude={clickPos.lat}>
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'rgba(45, 212, 191, 0.4)',
          border: '2px solid var(--orca-accent)',
          animation: 'pulse 1.5s infinite',
          transform: 'translate(-50%, -50%)'
        }}></div>
      </Marker>
      <Popup
        longitude={clickPos.lon}
        latitude={clickPos.lat}
        closeButton={false}
        closeOnClick={false}
        anchor="bottom"
        offset={15}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          backgroundColor: 'var(--orca-bg-surface)', 
          padding: '12px',
          border: '1px solid var(--orca-border)'
        }}>
          <div style={{ color: 'var(--orca-text-primary)', fontSize: '14px' }}>
            Use this location?
          </div>
          <div style={{ color: 'var(--orca-text-muted)', fontSize: '12px', fontFamily: 'monospace' }}>
            {clickPos.lat.toFixed(4)}, {clickPos.lon.toFixed(4)}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={() => {
                onLocationSelect?.(clickPos.lat, clickPos.lon);
                setClickPos(null);
              }}
              style={{
                backgroundColor: 'var(--orca-bg-tertiary)',
                color: 'var(--orca-text-primary)',
                border: '1px solid var(--orca-border)',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => setClickPos(null)}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--orca-text-secondary)',
                border: '1px solid transparent',
                padding: '4px 8px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Popup>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        /* Override popup background to maintain dark theme */
        .maplibregl-popup-content {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .maplibregl-popup-tip {
          display: none !important;
        }
      `}</style>
    </>
  );
}
