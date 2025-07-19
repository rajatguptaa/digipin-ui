import React, { useEffect, useRef, useState } from "react";
import { Box, Alert } from "@mui/material";
import { getLatLngFromDigiPin } from "digipinjs";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import { fromLonLat } from "ol/proj";
import { Style, Icon, Stroke } from "ol/style";
import ImageTile from "ol/ImageTile";

function digipinToLonLat(pin: string): [number, number] | null {
  try {
    const coordinates = getLatLngFromDigiPin(pin);
    if (
      coordinates &&
      typeof coordinates.latitude === "number" &&
      typeof coordinates.longitude === "number"
    ) {
      return [coordinates.longitude, coordinates.latitude];
    }
    return null;
  } catch {
    return null;
  }
}

const OLA_API_KEY = "uwPOdxssKyPG2w1lRZsLYjlkXVrvuKOMFDCpA85y";
const OLA_TILE_URL = `https://api.olamaps.io/tiles/v1/india/{z}/{x}/{y}.png?api_key=${OLA_API_KEY}`;

type Props = {
  geoPinA: string;
  geoPinB: string;
};

export const OlaMapPanel: React.FC<Props> = ({ geoPinA, geoPinB }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const [fallbackToOSM, setFallbackToOSM] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const lonLatA = digipinToLonLat(geoPinA);
    const lonLatB = digipinToLonLat(geoPinB);
    if (!lonLatA) return;

    if (mapInstance.current) {
      mapInstance.current.setTarget(undefined);
      mapInstance.current = null;
    }

    const features: Feature[] = [
      new Feature({ geometry: new Point(fromLonLat(lonLatA)) }),
    ];
    if (lonLatB) {
      features.push(new Feature({ geometry: new Point(fromLonLat(lonLatB)) }));
      features.push(
        new Feature({
          geometry: new LineString([
            fromLonLat(lonLatA) as [number, number],
            fromLonLat(lonLatB) as [number, number],
          ]),
        })
      );
    }
    features[0].setStyle(
      new Style({
        image: new Icon({
          src:
            "https://cdn.jsdelivr.net/npm/ol@v10.6.0/examples/data/icon.png",
          anchor: [0.5, 1],
        }),
      })
    );
    if (lonLatB) {
      features[1].setStyle(
        new Style({
          image: new Icon({
            src:
              "https://cdn.jsdelivr.net/npm/ol@v10.6.0/examples/data/icon.png",
            anchor: [0.5, 1],
            color: "#1976d2",
          }),
        })
      );
      features[2].setStyle(
        new Style({
          stroke: new Stroke({ color: "#1976d2", width: 3 }),
        })
      );
    }
    const vectorLayer = new VectorLayer({
      source: new VectorSource({ features }),
    });

    let tileLayer: TileLayer;
    if (!fallbackToOSM) {
      console.log("[OlaMapPanel] Using Ola Maps tile URL:", OLA_TILE_URL);
      tileLayer = new TileLayer({
        source: new XYZ({
          url: OLA_TILE_URL,
          tileLoadFunction: (imageTile, src) => {
            const imgTile = imageTile as ImageTile;
            (imgTile.getImage() as HTMLImageElement).onerror = () => {
              setErrorMsg("Ola Maps tiles failed to load. Falling back to OSM.");
              setFallbackToOSM(true);
            };
            (imgTile.getImage() as HTMLImageElement).src = src;
          },
        }),
      });
    } else {
      tileLayer = new TileLayer({ source: new OSM() });
      setErrorMsg("Ola Maps API key failed or tiles unavailable. Showing OSM map.");
    }

    const map = new Map({
      target: mapRef.current as HTMLDivElement,
      layers: [tileLayer, vectorLayer],
      view: new View({
        center: fromLonLat(lonLatA),
        zoom: 6,
      }),
      controls: [],
    });
    mapInstance.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, [geoPinA, geoPinB, fallbackToOSM]);

  return (
    <Box sx={{ height: 400, width: "100%", mt: 2 }}>
      {errorMsg && <Alert severity="warning">{errorMsg}</Alert>}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </Box>
  );
}; 