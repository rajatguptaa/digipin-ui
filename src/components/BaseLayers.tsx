import React, { useMemo } from "react";
import { LayersControl, TileLayer, useMapEvents } from "react-leaflet";
import { useTheme } from "@mui/material/styles";

export type BaseKey = "osm" | "cartoLight" | "cartoDark" | "esri";

export default function BaseLayers({
  initialBase,
  onBaseChange,
}: {
  initialBase?: BaseKey;
  onBaseChange?: (baseName: BaseKey) => void;
}) {
  const theme = useTheme();
  const defaultBase: BaseKey = useMemo(() => {
    if (initialBase) return initialBase;
    return theme.palette.mode === "dark" ? "cartoDark" : "cartoLight";
  }, [initialBase, theme.palette.mode]);

  useMapEvents({
    baselayerchange: (e: any) => {
      const name: string = e.name;
      const mapNameToKey: Record<string, BaseKey> = {
        OpenStreetMap: "osm",
        "Carto Light": "cartoLight",
        "Carto Dark": "cartoDark",
        "Esri Satellite": "esri",
      };
      const key = mapNameToKey[name];
      if (key && onBaseChange) onBaseChange(key);
    },
  });

  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer checked={defaultBase === "osm"} name="OpenStreetMap">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer checked={defaultBase === "cartoLight"} name="Carto Light">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer checked={defaultBase === "cartoDark"} name="Carto Dark">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer checked={defaultBase === "esri"} name="Esri Satellite">
        <TileLayer
          attribution="Tiles &copy; Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
      </LayersControl.BaseLayer>
    </LayersControl>
  );
}
