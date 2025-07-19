// TypeScript declaration for Ola Maps SDK
declare global {
  interface Window {
    OlaMaps: any;
  }
}

import React, { useEffect, useRef } from 'react';

const OLA_MAPS_API_KEY = "uwPOdxssKyPG2w1lRZsLYjlkXVrvuKOMFDCpA85y";
// Replace with a working style JSON URL from Ola Maps support when available
const OLA_MAPS_STYLE = "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json";

export interface OlaMapMarker {
  position: [number, number]; // [lng, lat]
  title?: string;
}

interface OlaMapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: OlaMapMarker[];
}

const OlaMap: React.FC<OlaMapProps> = ({
  center = [77.5946, 12.9716], // Default: Bengaluru
  zoom = 13,
  markers = [],
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (window.OlaMaps && mapRef.current) {
        clearInterval(checkInterval);

        // Clean up previous map instance if any
        if (mapInstance.current && mapInstance.current.remove) {
          mapInstance.current.remove();
        }

        const olaMaps = new window.OlaMaps({
          apiKey: OLA_MAPS_API_KEY,
        });

        mapInstance.current = olaMaps.init({
          style: OLA_MAPS_STYLE,
          container: mapRef.current,
          center,
          zoom,
        });

        // Add markers if any
        if (markers.length > 0 && mapInstance.current && mapInstance.current.addMarker) {
          markers.forEach(marker => {
            mapInstance.current.addMarker({
              position: marker.position,
              title: marker.title || '',
            });
          });
        }
      }
    }, 100);
    return () => clearInterval(checkInterval);
  }, [center, zoom, JSON.stringify(markers)]);

  return (
    <div
      ref={mapRef}
      style={{ height: '500px', width: '100%', background: '#eee' }}
    />
  );
};

export default OlaMap; 