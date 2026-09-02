import { useState, useCallback, useMemo } from 'react';
import Map, { NavigationControl, Source, Layer, Popup, AttributionControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapViewport, GeoJSONLayer, MarineData } from '../../types';
import MarineOverlays from './MarineOverlays';
import LayerControls from './LayerControls';
import MapClickHandler from './MapClickHandler';

interface MapPanelProps {
  viewport?: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  layers?: GeoJSONLayer[];
  onToggleLayer?: (layerId: string) => void;
  onMapClick?: (lat: number, lon: number) => void;
  marineData?: MarineData;
}

const DEFAULT_VIEWPORT: MapViewport = {
  longitude: 73.0,
  latitude: 18.5,
  zoom: 6,
};

export default function MapPanel({
  viewport = DEFAULT_VIEWPORT,
  onViewportChange,
  layers = [],
  onToggleLayer,
  onMapClick,
  marineData,
}: MapPanelProps) {
  const [cursorPos, setCursorPos] = useState<{ lat: number; lon: number } | null>(null);
  const [hoverInfo, setHoverInfo] = useState<any>(null);

  const activeLayerIds = useMemo(() => layers.filter(l => l.visible).map(l => l.id), [layers]);

  const handleMouseMove = useCallback((e: any) => {
    setCursorPos({ lat: e.lngLat.lat, lon: e.lngLat.lng });
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

  const handleMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        initialViewState={viewport}
        onMove={evt => onViewportChange?.(evt.viewState as MapViewport)}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactiveLayerIds={activeLayerIds}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        attributionControl={false}
      >
        <AttributionControl position="bottom-right" style={{ fontSize: '10px' }} />
        <NavigationControl position="top-right" showCompass={false} />

        {layers.map(layer => {
          if (!layer.visible) return null;
          let layerProps: any = {};
          switch (layer.type) {
            case 'pfz':
              layerProps = {
                type: 'fill',
                paint: {
                  'fill-color': '#2dd4bf',
                  'fill-opacity': 0.18,
                  'fill-outline-color': 'rgba(45,212,191,0.7)',
                },
              };
              break;
            case 'sst':
              layerProps = {
                type: 'circle',
                paint: {
                  'circle-radius': 6,
                  'circle-color': [
                    'interpolate', ['linear'], ['get', 'temp'],
                    22, '#1e3a8a',
                    25, '#2563eb',
                    27, '#2dd4bf',
                    29, '#f97316',
                    32, '#dc2626',
                  ],
                  'circle-opacity': 0.75,
                },
              };
              break;
            case 'current':
              layerProps = {
                type: 'line',
                paint: { 'line-color': '#3b82f6', 'line-width': 2, 'line-opacity': 0.8 },
              };
              break;
            case 'wave':
              layerProps = {
                type: 'circle',
                paint: {
                  'circle-radius': ['interpolate', ['linear'], ['get', 'height'], 0, 2, 10, 14],
                  'circle-color': '#3b82f6',
                  'circle-opacity': 0.6,
                },
              };
              break;
            case 'vessel':
              layerProps = {
                type: 'circle',
                paint: {
                  'circle-radius': 5,
                  'circle-color': '#f59e0b',
                  'circle-stroke-width': 1,
                  'circle-stroke-color': 'rgba(0,0,0,0.4)',
                },
              };
              break;
            default:
              layerProps = {
                type: 'circle',
                paint: { 'circle-radius': 4, 'circle-color': '#ffffff', 'circle-opacity': 0.8 },
              };
          }

          return (
            <Source key={layer.id} id={layer.id} type="geojson" data={layer.data}>
              <Layer id={layer.id} {...layerProps} />
            </Source>
          );
        })}

        {hoverInfo && Object.keys(hoverInfo.properties || {}).length > 0 && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={10}
          >
            <div style={{
              backgroundColor: 'var(--orca-bg-surface)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 10px',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '11px',
              color: 'var(--orca-text-primary)',
              minWidth: '120px',
            }}>
              {Object.entries(hoverInfo.properties as Record<string, unknown>).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ color: 'var(--orca-text-muted)' }}>{k}</span>
                  <span>{String(v)}</span>
                </div>
              ))}
            </div>
          </Popup>
        )}

        <MapClickHandler onLocationSelect={onMapClick} />
      </Map>

      {/* Cursor coordinates */}
      <div style={{
        position: 'absolute', bottom: 10, left: 10, zIndex: 10,
        backgroundColor: 'rgba(10,22,40,0.88)',
        border: '1px solid rgba(255,255,255,0.07)',
        color: 'var(--orca-text-muted)',
        padding: '3px 8px',
        fontFamily: 'ui-monospace, monospace',
        fontSize: '10px',
        letterSpacing: '0.04em',
      }}>
        {cursorPos
          ? 'LAT ' + cursorPos.lat.toFixed(4) + '  LON ' + cursorPos.lon.toFixed(4)
          : 'LAT --  LON --'}
      </div>

      {/* Layer controls */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <LayerControls layers={layers} onToggleLayer={onToggleLayer ?? (() => {})} />
      </div>

      {/* Marine data overlay */}
      <MarineOverlays activeLayers={activeLayerIds} marineData={marineData} />

      {/* Map CSS overrides */}
      <style>{`
        .maplibregl-popup-content {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .maplibregl-popup-tip { display: none !important; }
        .maplibregl-ctrl-attrib { font-size: 10px !important; opacity: 0.5; }
      `}</style>
    </div>
  );
}
