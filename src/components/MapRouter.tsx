import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { MapContainer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  getLatLngFromDigiPin,
} from "digipinjs";
import "leaflet/dist/leaflet.css";
import BaseLayers from "./BaseLayers";

type LatLngTuple = [number, number];

function digipinToLatLng(pin: string): LatLngTuple | null {
  const coordinates = getLatLngFromDigiPin(pin);
      if (
        coordinates &&
        typeof coordinates.latitude === "number" &&
        typeof coordinates.longitude === "number"
      ) {
        return [coordinates.latitude, coordinates.longitude];
      }
      return null;
}

function isValidLatLng(coords: LatLngTuple | null): coords is LatLngTuple {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === "number" &&
    typeof coords[1] === "number"
  );
}

type Props = {
  geoPinA: string;
  geoPinB: string;
};

export function MapTabPanel({ geoPinA, geoPinB }: Props) {
  const latLngA = digipinToLatLng(geoPinA);
  const latLngB = digipinToLatLng(geoPinB);

  if (!isValidLatLng(latLngA)) return <Box>Invalid DIGIPIN A location</Box>;

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={latLngA}
        zoom={12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <FitToPins a={latLngA} b={isValidLatLng(latLngB) ? latLngB : null} />
        <BaseLayers />

        <Marker position={latLngA}>
          <Popup>DIGIPIN A: {JSON.stringify(geoPinA)}</Popup>
        </Marker>

        {isValidLatLng(latLngB) && (
          <>
            <Marker position={latLngB}>
              <Popup>DIGIPIN B: {JSON.stringify(geoPinB)}</Popup>
            </Marker>
            <Polyline
              positions={[latLngA, latLngB]}
              pathOptions={{ color: "blue" }}
            />
          </>
        )}
      </MapContainer>
    </Box>
  );
}

function FitToPins({ a, b }: { a: [number, number]; b: [number, number] | null }) {
  const map = useMap();
  const keyA = `${a[0]},${a[1]}`;
  const keyB = b ? `${b[0]},${b[1]}` : "null";
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 0);
    if (b) {
      const bounds = L.latLngBounds([a[0], a[1]], [b[0], b[1]]);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView(a, 14);
    }
  }, [keyA, keyB, map]);
  return null;
}
