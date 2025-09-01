import React from 'react';
import { MapContainer, Rectangle, useMapEvents, GeoJSON } from 'react-leaflet';
import BaseLayers, { BaseKey } from './BaseLayers';

type Bounds = [[number, number], [number, number]];

function ZoomEvents({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  useMapEvents({
    zoomend: (e) => {
      // @ts-ignore
      const z = e.target.getZoom();
      onZoomChange(z);
    },
  });
  return null;
}

function IndiaBoundaryLayer() {
  const [data, setData] = React.useState<any | null>(null);
  React.useEffect(() => {
    fetch(`${process.env.PUBLIC_URL || ''}/india.geojson`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);
  if (!data) return null;
  return <GeoJSON data={data} style={{ color: '#64b5f6', weight: 1, fillOpacity: 0.05 }} />;
}

export default function MapView({
  center,
  zoom,
  indiaBounds,
  baseLayer,
  onBaseChange,
  onZoomChange,
  children,
}: {
  center: [number, number];
  zoom: number;
  indiaBounds: Bounds;
  baseLayer: BaseKey;
  onBaseChange: (k: BaseKey) => void;
  onZoomChange: (z: number) => void;
  children?: React.ReactNode;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', minHeight: 400 }}
      minZoom={4}
      maxBounds={indiaBounds}
      maxBoundsViscosity={1.0}
      bounds={indiaBounds}
    >
      <BaseLayers initialBase={baseLayer} onBaseChange={(k) => onBaseChange(k)} />
      <ZoomEvents onZoomChange={onZoomChange} />
      <Rectangle
        bounds={indiaBounds}
        pathOptions={{ color: '#64b5f6', weight: 2, fillColor: '#64b5f6', fillOpacity: 0.1, dashArray: '5, 5' }}
      />
      <IndiaBoundaryLayer />
      {children}
    </MapContainer>
  );
}

