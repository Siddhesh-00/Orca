import { useState, useCallback } from 'react';
import { MapViewport, GeoJSONLayer } from '../types';
import { mockLayers } from '../data/mockData';

export const useMapSync = () => {
  const [viewport, setViewport] = useState<MapViewport>({
    latitude: 18.5,
    longitude: 73.0,
    zoom: 6,
  });

  const [layers, setLayers] = useState<GeoJSONLayer[]>(mockLayers);

  const addLayer = useCallback((layer: GeoJSONLayer) => {
    setLayers(prev => [...prev.filter(l => l.id !== layer.id), layer]);
  }, []);

  const removeLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.filter(l => l.id !== layerId));
  }, []);

  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l));
  }, []);

  const flyTo = useCallback((lat: number, lon: number, zoom?: number) => {
    setViewport(prev => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      zoom: zoom ?? Math.max(prev.zoom, 7),
    }));
  }, []);

  const fitBounds = useCallback((bbox: [number, number, number, number]) => {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    setViewport(prev => ({
      ...prev,
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
    }));
  }, []);

  const getViewportBounds = useCallback((): [number, number, number, number] => {
    const off = 10 / viewport.zoom;
    return [
      viewport.longitude - off,
      viewport.latitude - off,
      viewport.longitude + off,
      viewport.latitude + off,
    ];
  }, [viewport]);

  const clearLayers = useCallback(() => setLayers([]), []);

  return {
    viewport,
    setViewport,
    layers,
    addLayer,
    removeLayer,
    toggleLayer,
    flyTo,
    fitBounds,
    getViewportBounds,
    clearLayers,
  };
};
