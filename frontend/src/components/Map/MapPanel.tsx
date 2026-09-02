import React, { useState, useCallback, useMemo } from 'react';
import Map, { NavigationControl, Source, Layer, Popup, AttributionControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapViewport, GeoJSONLayer } from '../../types';
import MarineOverlays from './MarineOverlays';
import LayerControls from './LayerControls';
import MapClickHandler from './MapClickHandler';

interface MapPanelProps {
  viewport?: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  layers?: GeoJSONLayer[];
  onToggleLayer?: (layerId: string) => void;
  onMapClick?: (lat: number, lon: number) => void;
}

const DEFAULT_VIEWPORT: MapViewport = {
  longitude: 75,
  latitude: 15,
  zoom: 5,
};

export default function MapPanel({
  viewport = DEFAULT_VIEWPORT,
  onViewportChange,
  layers = [],
  onToggleLayer,
  onMapClick,
}: MapPanelProps) {
  const [cursorPos, setCursorPos] = useState<{ lat: number; lon: number } | null>(null);
  const [hoverInfo, setHoverInfo] = useState<any>(null);

  const activeLayerTypes = useMemo(() => {
    return layers.filter(l => l.visible).map(l => l.type);
  }, [layers]);

  const handleMouseMove = useCallback((e: any) => {
    setCursorPos({
      lat: e.lngLat.lat,
      lon: e.lngLat.lng,
    });
    
    const feature = e.features?.[0];
    if (feature) {
      setHoverInfo({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        properties: feature.properties,
      });
    } else {
      setHoverInfo(null);
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        initialViewState={viewport}
        onMove={evt => onViewportChange?.(evt.viewState as MapViewport)}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactiveLayerIds={layers.filter(l => l.visible).map(l => l.id)}
        onMouseMove={handleMouseMove}
        attributionControl={false}
      >
        <AttributionControl position="bottom-right" style={{ fontSize: '10px', color: 'var(--orca-text-muted)' }} />
        <NavigationControl position="top-right" showCompass={false} />
        
        {layers.map(layer => {
          if (!layer.visible) return null;
          
          let layerProps: any = {};
          switch(layer.type) {
            case 'pfz':
              layerProps = {
                type: 'fill',
                paint: {
                  'fill-color': '#2dd4bf',
                  'fill-opacity': 0.2,
                  'fill-outline-color': 'rgba(45, 212, 191, 0.6)'
                }
              };
              break;
            case 'sst':
              layerProps = {
                type: 'circle',
                paint: {
                  'circle-radius': 5,
                  'circle-color': [
                    'interpolate', ['linear'], ['get', 'temp'],
                    15, '#1e3a8a',
                    20, '#2dd4bf',
                    30, '#f87171',
                    35, '#ef4444'
                  ],
                  'circle-opacity': 0.8
                }
              };
              break;
            case 'current':
              layerProps = {
                type: 'line',
                paint: {
                  'line-color': '#3b82f6',
                  'line-width': 2,
                  'line-opacity': 0.8
                }
              };
              break;
            case 'wave':
              layerProps = {
                type: 'circle',
                paint: {
                  'circle-radius': [
                    'interpolate', ['linear'], ['get', 'height'],
                    0, 2,
                    10, 15
                  ],
                  'circle-color': '#3b82f6',
                  'circle-opacity': 0.6
                }
              };
              break;
            case 'vessel':
              layerProps = {
                type: 'symbol',
                layout: {
                  'icon-image': 'triangle-11',
                  'icon-size': 1.5,
                  'icon-allow-overlap': true
                },
                paint: {
                  'icon-color': '#f59e0b'
                }
              };
              break;
            case 'custom':
            default:
              layerProps = {
                type: 'circle',
                paint: {
                  'circle-radius': 4,
                  'circle-color': '#ffffff'
                }
              };
              break;
          }

          return (
            <Source key={layer.id} id={layer.id} type="geojson" data={layer.data}>
              <Layer id={layer.id} {...layerProps} />
            </Source>
          );
        })}

        {hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            style={{
              backgroundColor: 'var(--orca-bg-surface)',
              color: 'var(--orca-text-primary)',
              border: '1px solid var(--orca-border)',
              padding: '8px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          >
            <div>
              {Object.entries(hoverInfo.properties).map(([k, v]) => (
                <div key={k}>
                  <span style={{ color: 'var(--orca-text-muted)' }}>{k}:</span> {String(v)}
                </div>
              ))}
            </div>
          </Popup>
        )}

        <MapClickHandler onLocationSelect={onMapClick} />
      </Map>

      {/* Overlays */}
      <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 10 }}>
        <div style={{
          backgroundColor: 'rgba(26, 45, 74, 0.8)',
          border: '1px solid var(--orca-border)',
          color: 'var(--orca-text-muted)',
          padding: '4px 8px',
          fontFamily: 'ui-monospace, SF Mono, monospace',
          fontSize: '10px',
        }}>
          {cursorPos ? `LAT: ${cursorPos.lat.toFixed(4)} | LON: ${cursorPos.lon.toFixed(4)}` : 'LAT: -- | LON: --'}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <LayerControls layers={layers} onToggleLayer={onToggleLayer || (() => {})} />
      </div>

      <MarineOverlays activeLayers={activeLayerTypes} />

      {/* Decorative Wave Overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '40px',
        pointerEvents: 'none',
        opacity: 0.1,
        overflow: 'hidden',
        zIndex: 5
      }}>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path fill="#2dd4bf" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,181.3C672,149,768,107,864,117.3C960,128,1056,192,1152,197.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
}
