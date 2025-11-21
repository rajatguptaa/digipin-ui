import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Autocomplete,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  MyLocation,
  Search,
  LocationOn,
  Straighten,
  Close,
  Star,
  StarBorder,
  Delete,
  Link as LinkIcon,
  GpsFixed,
  Storage as StorageIcon,
} from "@mui/icons-material";
// Leaflet imports removed
import {
  getDigiPin,
  getLatLngFromDigiPin,
  batchEncode,
  batchDecode,
  getDistance,
  findNearest,
} from "digipinjs";
import "./App.css";

import { MapplsMapView } from "./components/MapplsMapView";
import DigipinAssistant from "./components/DigipinAssistant";
import { MapTabPanel } from "./components/MapRouter";
import { BaseKey } from "./components/BaseLayers";
import MobileBottomSheet from "./components/MobileBottomSheet";
import { MainLayout } from "./layout/MainLayout";
import { EncodePanel } from "./features/encode/EncodePanel";
import { DecodePanel } from "./features/decode/DecodePanel";
import { BatchPanel } from "./features/batch/BatchPanel";
import { GeoPanel } from "./features/geo/GeoPanel";
import { Location, SearchResult, FavoriteItem } from "./types";

// Map Handler Removed

// India bounds
const indiaBounds: [[number, number], [number, number]] = [
  [6.5, 68.0],
  [37.1, 97.5],
];

const isWithinIndia = (lat: number, lng: number): boolean => {
  if (lat < 6.5 || lat > 37.1 || lng < 68.0 || lng > 97.5) return false;
  if (lat > 35.5 && lng > 74.0) return false;
  if (lat > 28.0 && lng > 95.0) return false;
  if (lat < 23.0 && lng < 70.0) return false;
  if (lat < 22.0 && lng > 88.0) return false;
  return true;
};

// Leaflet helper components removed

function App() {
  const [primaryTab, setPrimaryTab] = useState(0);
  const [encodeSubTab, setEncodeSubTab] = useState(0);
  const [encodeLat, setEncodeLat] = useState("");
  const [encodeLng, setEncodeLng] = useState("");
  const [encodeResult, setEncodeResult] = useState("");
  const [encodeError, setEncodeError] = useState("");
  const [decodeDigipin, setDecodeDigipin] = useState("");
  const [decodeResult, setDecodeResult] = useState<Location | null>(null);
  const [decodeError, setDecodeError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationName, setLocationName] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [invalidCoordinates, setInvalidCoordinates] = useState(false);
  const [invalidClickLocation, setInvalidClickLocation] = useState<[number, number] | null>(null);
  const lastValidPositionRef = useRef<[number, number] | null>(null);

  // Batch & Geo tab state
  const [batchInput, setBatchInput] = useState("");
  const [batchResult, setBatchResult] = useState<any[]>([]);
  const [batchError, setBatchError] = useState("");
  const [geoPinA, setGeoPinA] = useState("");
  const [geoPinB, setGeoPinB] = useState("");
  const [geoDistance, setGeoDistance] = useState<number | null>(null);
  const [geoDistanceError, setGeoDistanceError] = useState("");
  const [nearestBasePin, setNearestBasePin] = useState("");
  const [nearestList, setNearestList] = useState("");
  const [nearestResult, setNearestResult] = useState<string | null>(null);
  const [nearestError, setNearestError] = useState("");
  const [baseLayer, setBaseLayer] = useState<BaseKey>("cartoDark");
  const [mapZoom, setMapZoom] = useState(5);
  const [measureEnabled, setMeasureEnabled] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measureDistance, setMeasureDistance] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favDialogOpen, setFavDialogOpen] = useState(false);
  const [favLabel, setFavLabel] = useState("");
  const [accuracyCenter, setAccuracyCenter] = useState<[number, number] | null>(null);
  const [accuracyRadius, setAccuracyRadius] = useState<number | null>(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  useEffect(() => {
    if (encodeSubTab !== 2) {
      setGeoDistance(null);
    }
  }, [encodeSubTab]);

  useEffect(() => {
    if (selectedLocation) {
      lastValidPositionRef.current = [selectedLocation.lat, selectedLocation.lng];
    }
  }, [selectedLocation]);

  // Sync state into URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", String(primaryTab));
    params.set("zoom", String(mapZoom));
    params.set("encTab", String(encodeSubTab));
    if (baseLayer) params.set("base", baseLayer);
    else params.delete("base");
    if (selectedLocation) {
      params.set("lat", String(selectedLocation.lat));
      params.set("lng", String(selectedLocation.lng));
    } else {
      params.delete("lat");
      params.delete("lng");
    }
    if (encodeResult) params.set("encPin", encodeResult);
    else params.delete("encPin");
    if (decodeDigipin) params.set("decPin", decodeDigipin);
    else params.delete("decPin");
    if (geoPinA) params.set("geoA", geoPinA);
    else params.delete("geoA");
    if (geoPinB) params.set("geoB", geoPinB);
    else params.delete("geoB");
    if (geoDistance !== null) params.set("distance", String(geoDistance));
    else params.delete("distance");
    const query = params.toString();
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  }, [
    primaryTab,
    selectedLocation,
    encodeResult,
    decodeDigipin,
    geoPinA,
    geoPinB,
    geoDistance,
    baseLayer,
    mapZoom,
    encodeSubTab,
  ]);

  // Initialize state from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabStr = params.get("tab");
    if (tabStr !== null) {
      const idx = parseInt(tabStr, 10);
      if (!Number.isNaN(idx)) setPrimaryTab(idx);
    }
    const encTabStr = params.get("encTab");
    if (encTabStr !== null) {
      const encIdx = parseInt(encTabStr, 10);
      if (!Number.isNaN(encIdx)) setEncodeSubTab(encIdx);
    }
    const latStr = params.get("lat");
    const lngStr = params.get("lng");
    if (latStr && lngStr) {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!Number.isNaN(lat) && !Number.isNaN(lng) && isWithinIndia(lat, lng)) {
        setSelectedLocation({ lat, lng });
        setEncodeLat(lat.toFixed(6));
        setEncodeLng(lng.toFixed(6));
        setMapCenter([lat, lng]);
        fetchLocationName(lat, lng);
      }
    }
    const encPin = params.get("encPin");
    if (encPin) setEncodeResult(encPin);
    const decPin = params.get("decPin");
    if (decPin) setDecodeDigipin(decPin);
    const a = params.get("geoA");
    const b = params.get("geoB");
    if (a) setGeoPinA(a);
    if (b) setGeoPinB(b);
    const distance = params.get("distance");
    if (distance) {
      const d = parseFloat(distance);
      if (!Number.isNaN(d)) setGeoDistance(d);
    }
    const base = params.get("base");
    if (base && ["osm", "cartoLight", "cartoDark", "esri"].includes(base)) {
      setBaseLayer(base as BaseKey);
    }
    const zoomStr = params.get("zoom");
    if (zoomStr) {
      const z = parseInt(zoomStr, 10);
      if (!Number.isNaN(z)) setMapZoom(z);
    }
    try {
      const raw = localStorage.getItem("digipin_favorites");
      if (raw) setFavorites(JSON.parse(raw));
    } catch { }
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setPrimaryTab(newValue);
    if (newValue !== 0) setGeoDistance(null);
  };

  const handleEncodeTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setEncodeSubTab(newValue);
  };

  const encodeCoordinates = () => {
    try {
      setEncodeError("");
      const lat = parseFloat(encodeLat);
      const lng = parseFloat(encodeLng);
      if (isNaN(lat) || isNaN(lng)) {
        setEncodeError("Please enter valid coordinates");
        return;
      }
      if (!isWithinIndia(lat, lng)) {
        setEncodeError(
          `Coordinates must be within India (Latitude: ${indiaBounds[0][0]}° to ${indiaBounds[1][0]}°, Longitude: ${indiaBounds[0][1]}° to ${indiaBounds[1][1]}°)`
        );
        return;
      }
      const digipin = getDigiPin(lat, lng);
      setEncodeResult(digipin);
      setSelectedLocation({ lat, lng });
      setMapCenter([lat, lng]);
      fetchLocationName(lat, lng);
    } catch {
      setEncodeError("Error encoding coordinates");
    }
  };

  const decodeDigipinCode = () => {
    try {
      setDecodeError("");
      const coordinates = getLatLngFromDigiPin(decodeDigipin);
      if (!isWithinIndia(coordinates.latitude, coordinates.longitude)) {
        setDecodeError(
          `DIGIPIN resolves outside India. Valid latitude range is ${indiaBounds[0][0]}°–${indiaBounds[1][0]}° and longitude ${indiaBounds[0][1]}°–${indiaBounds[1][1]}°.`
        );
        setDecodeResult(null);
        return;
      }
      setDecodeResult({
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      });
      setSelectedLocation({
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      });
      setMapCenter([coordinates.latitude, coordinates.longitude]);
      fetchLocationName(coordinates.latitude, coordinates.longitude);
    } catch {
      setDecodeError("Invalid DIGIPIN code");
    }
  };

  const fetchLocationName = async (lat: number, lng: number) => {
    setLoadingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) setLocationName(data.display_name);
    } catch (error) {
      console.error("Error fetching location name:", error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords as any;
          if (isWithinIndia(latitude, longitude)) {
            setSelectedLocation({ lat: latitude, lng: longitude });
            setEncodeLat(latitude.toFixed(6));
            setEncodeLng(longitude.toFixed(6));
            setMapCenter([latitude, longitude]);
            fetchLocationName(latitude, longitude);
            setAccuracyCenter([latitude, longitude]);
            if (typeof accuracy === "number") setAccuracyRadius(accuracy);
          } else {
            alert("⚠️ Your current location is outside India. DIGIPIN only works for Indian coordinates.");
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ", India"
        )}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching places:", error);
    } finally {
      setSearching(false);
    }
  };

  const clearMeasurement = () => {
    setMeasurePoints([]);
    setMeasureDistance(null);
  };

  useEffect(() => {
    try {
      localStorage.setItem("digipin_favorites", JSON.stringify(favorites));
    } catch { }
  }, [favorites]);

  const openSaveFavorite = () => {
    if (!selectedLocation || !encodeResult) return;
    setFavLabel("");
    setFavDialogOpen(true);
  };
  const saveFavorite = () => {
    if (!selectedLocation || !encodeResult) return;
    const item = {
      id: Date.now(),
      label: favLabel || encodeResult,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      pin: encodeResult,
    };
    setFavorites((prev) => [item, ...prev]);
    setFavDialogOpen(false);
    setFavoritesOpen(true);
  };
  const deleteFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };
  const goToFavorite = (f: FavoriteItem) => {
    setPrimaryTab(0);
    setEncodeSubTab(0);
    setSelectedLocation({ lat: f.lat, lng: f.lng, name: f.label });
    setEncodeLat(f.lat.toFixed(6));
    setEncodeLng(f.lng.toFixed(6));
    setMapCenter([f.lat, f.lng]);
    setEncodeResult(f.pin);
    fetchLocationName(f.lat, f.lng);
  };

  const onMarkerDragEnd = (e: any) => {
    const marker = e.target;
    const pos = marker.getLatLng();
    const lat = pos.lat as number;
    const lng = pos.lng as number;
    const prev = lastValidPositionRef.current;

    if (isWithinIndia(lat, lng)) {
      setInvalidCoordinates(false);
      setInvalidClickLocation(null);
      setSelectedLocation({ lat, lng });
      setEncodeLat(lat.toFixed(6));
      setEncodeLng(lng.toFixed(6));
      setMapCenter([lat, lng]);
      try {
        const pin = getDigiPin(lat, lng);
        setEncodeResult(pin);
      } catch { }
      fetchLocationName(lat, lng);
      lastValidPositionRef.current = [lat, lng];
    } else {
      setInvalidCoordinates(true);
      if (prev) {
        setSelectedLocation({ lat: prev[0], lng: prev[1] });
        setMapCenter([prev[0], prev[1]]);
      }
      alert("⚠️ Please keep the marker within India. DIGIPIN only works for Indian coordinates.");
    }
  };

  const handleSearchSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (isWithinIndia(lat, lng)) {
      setSelectedLocation({ lat, lng, name: result.display_name });
      setEncodeLat(lat.toFixed(6));
      setEncodeLng(lng.toFixed(6));
      setLocationName(result.display_name);
      setMapCenter([lat, lng]);
      setSearchQuery("");
      setSearchResults([]);
    } else {
      alert("⚠️ This location is outside India. DIGIPIN only works for Indian coordinates.");
    }
  };

  const handleMapClick = async (coords: { lat: number; lng: number }) => {
    const { lat, lng } = coords;
    const coordinatesWithinIndia = isWithinIndia(lat, lng);

    if (coordinatesWithinIndia) {
      setInvalidCoordinates(false);
      setInvalidClickLocation(null);
      setEncodeLat(lat.toFixed(6));
      setEncodeLng(lng.toFixed(6));
      setSelectedLocation({ lat, lng });
      setMapCenter([lat, lng]);
      fetchLocationName(lat, lng);
    } else {
      setInvalidCoordinates(true);
      setInvalidClickLocation([lat, lng]);
      setEncodeLat("");
      setEncodeLng("");
      setLocationName("");
      setTimeout(() => setInvalidClickLocation(null), 3000);
      alert(
        "⚠️ Please select a location within India. DIGIPIN only works for Indian coordinates.\n\nIndia bounds: Latitude 6.5° to 37.1°, Longitude 68.0° to 97.5°"
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBatchEncode = () => {
    setBatchError("");
    try {
      const lines = batchInput
        .split(/\n|,/)
        .map((l) => l.trim())
        .filter(Boolean);
      const coords = lines.map((line) => {
        const [lat, lng] = line.split(/\s*[, ]\s*/);
        return { lat: parseFloat(lat), lng: parseFloat(lng) };
      });
      if (coords.some((c) => isNaN(c.lat) || isNaN(c.lng))) {
        setBatchError("Invalid coordinates format. Use: lat,lng per line or comma separated.");
        setBatchResult([]);
        return;
      }
      const invalidCoord = coords.find((c) => !isWithinIndia(c.lat, c.lng));
      if (invalidCoord) {
        setBatchError(
          `Coordinates ${invalidCoord.lat}, ${invalidCoord.lng} fall outside India (lat ${indiaBounds[0][0]}°–${indiaBounds[1][0]}°, lng ${indiaBounds[0][1]}°–${indiaBounds[1][1]}°).`
        );
        setBatchResult([]);
        return;
      }
      const pins = batchEncode(coords);
      setBatchResult(
        pins.map((pin, i) => ({
          input: `${coords[i].lat},${coords[i].lng}`,
          result: pin,
        }))
      );
    } catch {
      setBatchError("Error in batch encoding.");
      setBatchResult([]);
    }
  };
  const handleBatchDecode = () => {
    setBatchError("");
    try {
      const lines = batchInput
        .split(/\n|,/)
        .map((l) => l.trim())
        .filter(Boolean);
      const pins = lines;
      const coords = batchDecode(pins);
      setBatchResult(
        coords.map((coord, i) => {
          if (!coord) {
            return { input: pins[i], result: "Invalid DIGIPIN" };
          }
          if (!isWithinIndia(coord.latitude, coord.longitude)) {
            return {
              input: pins[i],
              result: "Outside India bounds",
            };
          }
          return {
            input: pins[i],
            result: `${coord.latitude},${coord.longitude}`,
          };
        })
      );
    } catch {
      setBatchError("Error in batch decoding.");
      setBatchResult([]);
    }
  };
  const handleGeoDistance = () => {
    setGeoDistanceError("");
    setGeoDistance(null);
    try {
      if (!geoPinA || !geoPinB) {
        setGeoDistanceError("Please enter two DIGIPINs.");
        return;
      }
      const dist = getDistance(geoPinA.trim(), geoPinB.trim());
      setGeoDistance(dist);
    } catch {
      setGeoDistanceError("Invalid DIGIPIN(s) or error calculating distance.");
    }
  };
  const handleFindNearest = () => {
    setNearestError("");
    setNearestResult(null);
    try {
      const base = nearestBasePin.trim();
      const list = nearestList
        .split(/\n|,/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (!base || list.length === 0) {
        setNearestError("Enter a base DIGIPIN and a list of DIGIPINs.");
        return;
      }
      const nearest = findNearest(base, list);
      setNearestResult(nearest);
    } catch {
      setNearestError("Error finding nearest DIGIPIN.");
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) searchPlaces(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Render content based on tabs
  const encodeSingleContent = (
    <EncodePanel
      encodeLat={encodeLat}
      setEncodeLat={setEncodeLat}
      encodeLng={encodeLng}
      setEncodeLng={setEncodeLng}
      encodeResult={encodeResult}
      encodeError={encodeError}
      onEncode={encodeCoordinates}
      onSaveFavorite={openSaveFavorite}
      invalidCoordinates={invalidCoordinates}
      locationName={locationName}
      loadingLocation={loadingLocation}
      selectedLocation={selectedLocation}
      copied={copied}
      onCopy={copyToClipboard}
    />
  );

  const encodeBatchContent = (
    <BatchPanel
      batchInput={batchInput}
      setBatchInput={setBatchInput}
      batchResult={batchResult}
      batchError={batchError}
      onBatchEncode={handleBatchEncode}
      onBatchDecode={handleBatchDecode}
    />
  );

  const encodeGeoContent = (
    <GeoPanel
      geoPinA={geoPinA}
      setGeoPinA={setGeoPinA}
      geoPinB={geoPinB}
      setGeoPinB={setGeoPinB}
      geoDistance={geoDistance}
      geoDistanceError={geoDistanceError}
      onCalculateDistance={handleGeoDistance}
      nearestBasePin={nearestBasePin}
      setNearestBasePin={setNearestBasePin}
      nearestList={nearestList}
      setNearestList={setNearestList}
      nearestResult={nearestResult}
      nearestError={nearestError}
      onFindNearest={handleFindNearest}
    />
  );

  const decodeContentView = (
    <DecodePanel
      decodeDigipin={decodeDigipin}
      setDecodeDigipin={setDecodeDigipin}
      decodeResult={decodeResult}
      decodeError={decodeError}
      onDecode={decodeDigipinCode}
    />
  );

  const assistantContentView = <DigipinAssistant />;

  return (
    <MainLayout
      onInfoClick={() => setInfoOpen(true)}
      currentTab={primaryTab}
      onTabChange={handleTabChange}
    >
      <Box sx={{ display: "flex", flexDirection: "row", height: "100%", width: "100vw" }}>
        {/* Map Area */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            position: "relative",
            display: isMobile && primaryTab !== 0 ? "none" : "block",
          }}
        >
          <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
            <MapplsMapView
              center={{ lat: mapCenter[0], lng: mapCenter[1] }}
              zoom={mapZoom}
              onClick={handleMapClick}
              onMapLoad={(map) => {
                // Add marker logic here if needed, or use a separate effect
                if (selectedLocation) {
                  new window.mappls.Marker({
                    map: map,
                    position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
                    draggable: true,
                  });
                }
              }}
            />
          </Box>

          {!isMobile && (
            <>
              {/* Quick Actions SpeedDial when panel is collapsed */}
              {panelCollapsed && (
                <SpeedDial
                  ariaLabel="Open tools"
                  sx={{ position: "absolute", right: 20, top: "50%", zIndex: 2000 }}
                  icon={<SpeedDialIcon />}
                  onOpen={() => setPanelCollapsed(false)}
                >
                  <SpeedDialAction
                    key="Encode"
                    icon={<LocationOn />}
                    tooltipTitle="Encode"
                    onClick={() => {
                      setPrimaryTab(0);
                      setEncodeSubTab(0);
                      setPanelCollapsed(false);
                    }}
                  />
                  <SpeedDialAction
                    key="Decode"
                    icon={<Search />}
                    tooltipTitle="Decode"
                    onClick={() => {
                      setPrimaryTab(1);
                      setPanelCollapsed(false);
                    }}
                  />
                  <SpeedDialAction
                    key="Batch"
                    icon={<StorageIcon />}
                    tooltipTitle="Batch"
                    onClick={() => {
                      setPrimaryTab(0);
                      setEncodeSubTab(1);
                      setPanelCollapsed(false);
                    }}
                  />
                  <SpeedDialAction
                    key="Geo"
                    icon={<Straighten />}
                    tooltipTitle="Geo Utilities"
                    onClick={() => {
                      setPrimaryTab(0);
                      setEncodeSubTab(2);
                      setPanelCollapsed(false);
                    }}
                  />
                </SpeedDial>
              )}
            </>
          )}
        </Box>

        {/* Sidebar Panel (Desktop) */}
        {!isMobile && !panelCollapsed && (
          <Box
            sx={{
              width: 400,
              maxWidth: 400,
              minWidth: 320,
              height: "100%",
              backgroundColor: "background.paper",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
              <Tooltip title="Collapse tools">
                <IconButton size="small" onClick={() => setPanelCollapsed(true)} sx={{ color: "#64b5f6" }}>
                  <Close />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ width: "100%", height: "100%", overflowY: "auto", p: 0 }}>
              <Tabs
                value={primaryTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ backgroundColor: "rgba(100, 181, 246, 0.1)" }}
              >
                <Tab label="Encode" sx={{ color: "#64b5f6" }} />
                <Tab label="Decode" sx={{ color: "#64b5f6" }} />
                <Tab label="AI Assistant" sx={{ color: "#64b5f6" }} />
              </Tabs>
              <Box sx={{ p: { xs: 1, sm: 2 } }}>
                {primaryTab === 0 && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Tabs
                      value={encodeSubTab}
                      onChange={handleEncodeTabChange}
                      variant="fullWidth"
                      sx={{ backgroundColor: "rgba(100, 181, 246, 0.08)" }}
                    >
                      <Tab value={0} label="Single" sx={{ color: "#64b5f6" }} />
                      <Tab value={1} label="Batch" sx={{ color: "#64b5f6" }} />
                      <Tab value={2} label="Geo" sx={{ color: "#64b5f6" }} />
                    </Tabs>
                    <Box sx={{ mt: 1 }}>
                      {encodeSubTab === 0 && encodeSingleContent}
                      {encodeSubTab === 1 && encodeBatchContent}
                      {encodeSubTab === 2 && encodeGeoContent}
                    </Box>
                  </Box>
                )}
                {primaryTab === 1 && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>{decodeContentView}</Box>
                )}
                {primaryTab === 2 && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>{assistantContentView}</Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Search Bar */}
      <Paper
        elevation={4}
        sx={{
          position: "absolute",
          top: 80,
          left: 20,
          width: 350,
          zIndex: 1000,
          borderRadius: 2,
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Autocomplete
            freeSolo
            options={searchResults}
            disablePortal={false}
            slotProps={{ popper: { sx: { zIndex: 2000 } } }}
            getOptionLabel={(option) => (typeof option === "string" ? option : option.display_name)}
            inputValue={searchQuery}
            onInputChange={(_, newInputValue) => {
              setSearchQuery(newInputValue);
            }}
            onChange={(_, newValue) => {
              if (newValue && typeof newValue !== "string") {
                handleSearchSelect(newValue);
              }
            }}
            loading={searching}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search places in India..."
                variant="outlined"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
                  endAdornment: (
                    <>
                      {searching ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <LocationOn sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body2" noWrap>
                  {option.display_name}
                </Typography>
              </Box>
            )}
            noOptionsText="No places found"
            sx={{ width: "100%" }}
          />
        </Box>
      </Paper>

      {/* Floating Action Buttons */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: "calc(env(safe-area-inset-bottom) + 80px)", sm: 30 },
          left: { xs: "auto", sm: 20 },
          right: { xs: 20, sm: "auto" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          zIndex: 1000,
        }}
      >
        {/* Current Location */}
        <Fab
          color="primary"
          aria-label="current location"
          onClick={getCurrentLocation}
          size="medium"
        >
          <MyLocation />
        </Fab>

        {/* Measure Tool Toggle */}
        <Fab
          color={measureEnabled ? "secondary" : "default"}
          aria-label="measure distance"
          onClick={() => setMeasureEnabled((v) => !v)}
          size="medium"
          sx={{ backgroundColor: measureEnabled ? "#81c784" : "#2b2b2b" }}
        >
          <Straighten />
        </Fab>

        {/* Clear measurement */}
        {measureEnabled && (
          <Fab
            color="default"
            aria-label="clear measurement"
            onClick={clearMeasurement}
            size="medium"
            sx={{ backgroundColor: "#2b2b2b" }}
          >
            <Close />
          </Fab>
        )}

        {/* Recenter */}
        {selectedLocation && (
          <Fab
            color="default"
            aria-label="recenter"
            onClick={() => setMapCenter([selectedLocation.lat, selectedLocation.lng])}
            size="medium"
            sx={{ backgroundColor: "#2b2b2b" }}
          >
            <GpsFixed />
          </Fab>
        )}

        {/* Copy shareable link */}
        <Fab
          color="default"
          aria-label="copy link"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
          }}
          size="medium"
          sx={{ backgroundColor: "#2b2b2b" }}
        >
          <LinkIcon />
        </Fab>

        {/* Favorites toggle */}
        <Fab
          color={favoritesOpen ? "secondary" : "default"}
          aria-label="favorites"
          onClick={() => setFavoritesOpen((v) => !v)}
          size="medium"
          sx={{ backgroundColor: favoritesOpen ? "#81c784" : "#2b2b2b" }}
        >
          {favoritesOpen ? <Star /> : <StarBorder />}
        </Fab>
      </Box>

      {/* Measurement readout */}
      {measureEnabled && measureDistance !== null && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            bottom: 100,
            left: { xs: "auto", sm: 80 },
            right: { xs: 20, sm: "auto" },
            zIndex: 1000,
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            px: 2,
            py: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        >
          <Typography variant="body2" sx={{ color: "#fff" }}>
            Distance: {measureDistance < 1000 ? `${measureDistance.toFixed(0)} m` : `${(measureDistance / 1000).toFixed(2)} km`}
          </Typography>
        </Paper>
      )}

      <Snackbar open={copiedLink} message="Link copied" anchorOrigin={{ vertical: "bottom", horizontal: "left" }} />

      {/* Favorites Panel */}
      {favoritesOpen && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            top: 80,
            right: 20,
            width: 320,
            maxHeight: "70vh",
            overflowY: "auto",
            zIndex: 2000,
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ color: "#fff", mb: 1 }}>
              Favorites
            </Typography>
            <List dense>
              {favorites.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No favorites yet. Save one from the Encode tab.
                </Typography>
              )}
              {favorites.map((f) => (
                <ListItem
                  key={f.id}
                  secondaryAction={
                    <Box>
                      <Tooltip title="Go to">
                        <IconButton onClick={() => goToFavorite(f)} sx={{ color: "#64b5f6" }}>
                          <GpsFixed />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => deleteFavorite(f.id)} sx={{ color: "#f44336" }}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={<Typography sx={{ color: "#fff" }}>{f.label}</Typography>}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {f.pin}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      )}

      {/* Favorite label dialog */}
      <Dialog open={favDialogOpen} onClose={() => setFavDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: "#fff" }}>Save Favorite</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Label"
            fullWidth
            variant="outlined"
            value={favLabel}
            onChange={(e) => setFavLabel(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFavDialogOpen(false)} sx={{ color: "#64b5f6" }}>
            Cancel
          </Button>
          <Button onClick={saveFavorite} variant="contained" sx={{ backgroundColor: "#64b5f6" }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Dialog */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "#ffffff" }}>
          About DIGIPIN
          <IconButton
            aria-label="close"
            onClick={() => setInfoOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8, color: "#64b5f6" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography paragraph sx={{ color: "#ffffff" }}>
            DIGIPIN (Digital Postal Index Number) is a geocoding system for India that converts latitude and longitude
            coordinates into a unique alphanumeric code.
          </Typography>
          <Typography paragraph sx={{ color: "#ffffff" }}>
            <strong>Features:</strong>
          </Typography>
          <ul style={{ color: "#b0b0b0" }}>
            <li>Search for places in India and navigate directly to them</li>
            <li>Click anywhere on the map of India to select coordinates</li>
            <li>Get location names automatically using reverse geocoding</li>
            <li>Use the current location button to get your exact position</li>
            <li>Convert coordinates to DIGIPIN and vice versa</li>
            <li>Copy results to clipboard with one click</li>
          </ul>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Powered by{" "}
            <a
              href="https://github.com/rajatguptaa/digipinjs"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#64b5f6" }}
            >
              digipinjs
            </a>{" "}
            and{" "}
            <a
              href="https://nominatim.openstreetmap.org/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#64b5f6" }}
            >
              Nominatim
            </a>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoOpen(false)} sx={{ color: "#64b5f6" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

export default App;
