import { Box } from "@mui/material";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import {
  getLatLngFromDigiPin,
} from "digipinjs";
import "leaflet/dist/leaflet.css";

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
    <Box sx={{ height: 400, width: "100%", mt: 2 }}>
      <MapContainer
        center={latLngA}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
