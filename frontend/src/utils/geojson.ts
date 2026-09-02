export const createPointFeature = (lat: number, lon: number, properties: any = {}) => {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lon, lat]
    },
    properties
  };
};

export const createBBoxPolygon = (minLon: number, minLat: number, maxLon: number, maxLat: number) => {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [minLon, minLat],
        [maxLon, minLat],
        [maxLon, maxLat],
        [minLon, maxLat],
        [minLon, minLat]
      ]]
    },
    properties: {}
  };
};

export const mergeFeatureCollections = (...collections: any[]) => {
  const features = collections.reduce((acc, fc) => {
    if (fc && fc.type === 'FeatureCollection' && Array.isArray(fc.features)) {
      return [...acc, ...fc.features];
    }
    return acc;
  }, []);
  
  return {
    type: 'FeatureCollection',
    features
  };
};

export const featureCollectionFromPoints = (points: any[]) => {
  const features = points.map(p => {
    const { lat, lon, ...properties } = p;
    return createPointFeature(lat, lon, properties);
  });
  return {
    type: 'FeatureCollection',
    features
  };
};

export const getFeatureCollectionBounds = (fc: any): [number, number, number, number] | null => {
  if (!fc || fc.type !== 'FeatureCollection' || !fc.features || fc.features.length === 0) return null;
  
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  
  fc.features.forEach((f: any) => {
    if (f.geometry && f.geometry.type === 'Point') {
      const [lon, lat] = f.geometry.coordinates;
      minLon = Math.min(minLon, lon);
      minLat = Math.min(minLat, lat);
      maxLon = Math.max(maxLon, lon);
      maxLat = Math.max(maxLat, lat);
    }
  });
  
  if (minLon === Infinity) return [0,0,0,0];
  return [minLon, minLat, maxLon, maxLat];
};

export const isValidGeoJSON = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  return data.type === 'FeatureCollection' || data.type === 'Feature' || data.type === 'Point';
};
