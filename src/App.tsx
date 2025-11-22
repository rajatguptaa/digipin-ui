import React, { useState, useEffect } from "react";
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
import { BaseKey } from "./components/BaseLayers";
import MobileBottomSheet from "./components/MobileBottomSheet";
import { FloatingPanel } from "./components/FloatingPanel";
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
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [currentMarker, setCurrentMarker] = useState<any>(null);
  const [measureMarkers, setMeasureMarkers] = useState<any[]>([]);
  const [measurePolyline, setMeasurePolyline] = useState<any>(null);
  const [geoMarkers, setGeoMarkers] = useState<any[]>([]);
  const [geoPolyline, setGeoPolyline] = useState<any>(null);
  const [isGeoVisualizationActive, setIsGeoVisualizationActive] = useState(false);

  useEffect(() => {
    if (encodeSubTab !== 2) {
      setGeoDistance(null);
    }
  }, [encodeSubTab]);

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
    if (newValue !== 0) {
      setGeoDistance(null);
      // Clear geo markers and polyline when switching away from Encode tab
      geoMarkers.forEach(marker => {
        try {
          marker.remove();
        } catch (e) {
          console.error("Error removing geo marker:", e);
        }
      });
      setGeoMarkers([]);
      setIsGeoVisualizationActive(false);
      if (geoPolyline) {
        try {
          geoPolyline.remove();
        } catch (e) {
          console.error("Error removing geo polyline:", e);
        }
        setGeoPolyline(null);
      }
    }
    // Open mobile drawer when switching tabs on mobile
    if (isMobile) {
      setMobileDrawerOpen(true);
    }
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
          const { latitude, longitude } = position.coords as any;
          if (isWithinIndia(latitude, longitude)) {
            setSelectedLocation({ lat: latitude, lng: longitude });
            setEncodeLat(latitude.toFixed(6));
            setEncodeLng(longitude.toFixed(6));
            setMapCenter([latitude, longitude]);
            fetchLocationName(latitude, longitude);
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

    // Clear measurement markers
    measureMarkers.forEach(marker => {
      try {
        marker.remove();
      } catch (e) {
        console.error("Error removing measurement marker:", e);
      }
    });
    setMeasureMarkers([]);

    // Clear measurement polyline
    if (measurePolyline) {
      try {
        measurePolyline.remove();
      } catch (e) {
        console.error("Error removing polyline:", e);
      }
      setMeasurePolyline(null);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem("digipin_favorites", JSON.stringify(favorites));
    } catch { }
  }, [favorites]);

  // Manage marker on map
  useEffect(() => {
    if (!mapInstance || !window.mappls) return;

    // Skip marker management if geo visualization is active
    if (isGeoVisualizationActive) return;

    // Remove old marker if exists
    if (currentMarker) {
      try {
        currentMarker.remove();
      } catch (e) {
        console.error("Error removing marker:", e);
      }
    }

    // Add new marker if location is selected
    if (selectedLocation) {
      try {
        const marker = new window.mappls.Marker({
          map: mapInstance,
          position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
          draggable: true,
        });

        // Add drag event listener
        marker.addListener("dragend", (e: any) => {
          if (e.lngLat) {
            const lat = e.lngLat.lat;
            const lng = e.lngLat.lng;
            if (isWithinIndia(lat, lng)) {
              setSelectedLocation({ lat, lng });
              setEncodeLat(lat.toFixed(6));
              setEncodeLng(lng.toFixed(6));
              setMapCenter([lat, lng]);
              try {
                const pin = getDigiPin(lat, lng);
                setEncodeResult(pin);
              } catch { }
              fetchLocationName(lat, lng);
            } else {
              alert("⚠️ Please keep the marker within India. DIGIPIN only works for Indian coordinates.");
              // Reset marker to previous position
              marker.setPosition({ lat: selectedLocation.lat, lng: selectedLocation.lng });
            }
          }
        });

        setCurrentMarker(marker);
      } catch (error) {
        console.error("Error creating marker:", error);
      }
    }
  }, [selectedLocation, mapInstance, isGeoVisualizationActive]);

  // Manage measurement visualization (markers and polyline)
  useEffect(() => {
    if (!mapInstance || !window.mappls) return;

    // Clear old measurement markers
    measureMarkers.forEach(marker => {
      try {
        marker.remove();
      } catch (e) {
        console.error("Error removing old measurement marker:", e);
      }
    });

    // Clear old polyline
    if (measurePolyline) {
      try {
        measurePolyline.remove();
      } catch (e) {
        console.error("Error removing old polyline:", e);
      }
    }

    // Create new markers for measurement points
    const newMarkers: any[] = [];
    measurePoints.forEach((point, index) => {
      try {
        const marker = new window.mappls.Marker({
          map: mapInstance,
          position: { lat: point[0], lng: point[1] },
          icon: {
            url: `data:image/svg+xml;base64,${btoa(`
              <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="${index === 0 ? '#ef4444' : '#3b82f6'}" stroke="white" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${index + 1}</text>
              </svg>
            `)}`,
            width: 24,
            height: 24,
          },
        });
        newMarkers.push(marker);
      } catch (error) {
        console.error("Error creating measurement marker:", error);
      }
    });

    setMeasureMarkers(newMarkers);

    // Draw polyline if we have 2 points
    if (measurePoints.length === 2) {
      try {
        const polyline = new window.mappls.Polyline({
          map: mapInstance,
          paths: [
            { lat: measurePoints[0][0], lng: measurePoints[0][1] },
            { lat: measurePoints[1][0], lng: measurePoints[1][1] },
          ],
          strokeColor: '#3b82f6',
          strokeWeight: 3,
          strokeOpacity: 0.8,
          dashArray: [10, 5],
        });
        setMeasurePolyline(polyline);
      } catch (error) {
        console.error("Error creating polyline:", error);
      }
    }
  }, [measurePoints, mapInstance]);

  // Clear measurements when measurement mode is disabled
  useEffect(() => {
    if (!measureEnabled && (measurePoints.length > 0 || measureDistance !== null)) {
      clearMeasurement();
    }
  }, [measureEnabled]);

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

  const handleSearchSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (isWithinIndia(lat, lng)) {
      setSelectedLocation({ lat, lng, name: result.display_name });
      setEncodeLat(lat.toFixed(6));
      setEncodeLng(lng.toFixed(6));
      setLocationName(result.display_name);
      setMapCenter([lat, lng]);
      setMapZoom(15); // Zoom to street level when selecting a search result
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

      // If measure mode is enabled, add point for distance measurement
      if (measureEnabled) {
        const newPoints = [...measurePoints, [lat, lng] as [number, number]];
        setMeasurePoints(newPoints);

        // Calculate distance if we have 2 points
        if (newPoints.length === 2) {
          try {
            const [lat1, lng1] = newPoints[0];
            const [lat2, lng2] = newPoints[1];
            // Calculate distance using Haversine formula
            const R = 6371e3; // Earth radius in meters
            const φ1 = (lat1 * Math.PI) / 180;
            const φ2 = (lat2 * Math.PI) / 180;
            const Δφ = ((lat2 - lat1) * Math.PI) / 180;
            const Δλ = ((lng2 - lng1) * Math.PI) / 180;

            const a =
              Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            setMeasureDistance(distance);
          } catch (error) {
            console.error("Error calculating distance:", error);
          }
        }
      } else {
        // Normal mode: select location
        setEncodeLat(lat.toFixed(6));
        setEncodeLng(lng.toFixed(6));
        setSelectedLocation({ lat, lng });
        setMapCenter([lat, lng]);
        fetchLocationName(lat, lng);

        // Auto-encode the location
        try {
          const pin = getDigiPin(lat, lng);
          setEncodeResult(pin);
        } catch (error) {
          console.error("Error encoding location:", error);
        }
      }
    } else {
      setInvalidCoordinates(true);
      setEncodeLat("");
      setEncodeLng("");
      setLocationName("");
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

    // Clear previous geo markers and polyline
    geoMarkers.forEach(marker => {
      try {
        marker.remove();
      } catch (e) {
        console.error("Error removing geo marker:", e);
      }
    });
    setGeoMarkers([]);
    setIsGeoVisualizationActive(false);

    if (geoPolyline) {
      try {
        geoPolyline.remove();
      } catch (e) {
        console.error("Error removing polyline:", e);
      }
      setGeoPolyline(null);
    }

    try {
      if (!geoPinA || !geoPinB) {
        setGeoDistanceError("Please enter two DIGIPINs.");
        return;
      }

      // Calculate distance
      const dist = getDistance(geoPinA.trim(), geoPinB.trim());
      setGeoDistance(dist);

      // Decode DIGIPINs to get coordinates
      const coordsA = getLatLngFromDigiPin(geoPinA.trim());
      const coordsB = getLatLngFromDigiPin(geoPinB.trim());

      if (!coordsA || !coordsB) {
        setGeoDistanceError("Could not decode one or both DIGIPINs.");
        return;
      }

      const latA = coordsA.latitude;
      const lngA = coordsA.longitude;
      const latB = coordsB.latitude;
      const lngB = coordsB.longitude;

      // Create markers on the map
      if (mapInstance && window.mappls) {
        const newMarkers: any[] = [];

        try {
          console.log("Creating marker A at:", latA, lngA);
          console.log("Creating marker B at:", latB, lngB);

          // Marker A (default red marker)
          const markerA = new window.mappls.Marker({
            map: mapInstance,
            position: { lat: latA, lng: lngA },
            title: "DIGIPIN A",
          });
          newMarkers.push(markerA);
          console.log("Marker A created:", markerA);

          // Marker B (default red marker)
          const markerB = new window.mappls.Marker({
            map: mapInstance,
            position: { lat: latB, lng: lngB },
            title: "DIGIPIN B",
          });
          newMarkers.push(markerB);
          console.log("Marker B created:", markerB);

          setGeoMarkers(newMarkers);
          console.log("Total markers created:", newMarkers.length);

          // Draw polyline between the two points
          const polyline = new window.mappls.Polyline({
            map: mapInstance,
            paths: [
              { lat: latA, lng: lngA },
              { lat: latB, lng: lngB },
            ],
            strokeColor: '#10b981',
            strokeWeight: 3,
            strokeOpacity: 0.8,
            dashArray: [8, 4],
          });
          setGeoPolyline(polyline);
          console.log("Polyline created");

          // Set flag to prevent marker interference
          setIsGeoVisualizationActive(true);

          // Clear the regular marker to avoid interference
          if (currentMarker) {
            try {
              currentMarker.remove();
            } catch (e) {
              console.error("Error removing current marker:", e);
            }
            setCurrentMarker(null);
          }

          // Adjust map to show both points
          const centerLat = (latA + latB) / 2;
          const centerLng = (lngA + lngB) / 2;
          setMapCenter([centerLat, centerLng]);

          // Calculate appropriate zoom level based on distance
          let zoom = 5;
          if (dist < 1000) zoom = 15;
          else if (dist < 5000) zoom = 13;
          else if (dist < 20000) zoom = 11;
          else if (dist < 100000) zoom = 9;
          else if (dist < 500000) zoom = 7;
          setMapZoom(zoom);

        } catch (error) {
          console.error("Error creating geo visualization:", error);
        }
      }

    } catch (error) {
      console.error("Error in handleGeoDistance:", error);
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
  // Helper functions
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBatchResult = () => {
    if (batchResult.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Address,DIGIPIN,Latitude,Longitude,Error"].join(",") + "\n" +
      batchResult.map(r => `"${r.address}","${r.digipin}",${r.lat},${r.lng},"${r.error}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "digipin_batch_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Using findNearest as a proxy for search since we don't have a dedicated search API in the context
      // In a real app, this would call a geocoding API
      // For now, we'll simulate some results or use the findNearest if applicable
      // Or we can use the Mappls search if available via window.mappls

      // Mock implementation for now to fix the error
      // Ideally this should call an actual search service
      const results: SearchResult[] = [];
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  // Content Views
  const encodeContentView = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Tabs
        value={encodeSubTab}
        onChange={handleEncodeTabChange}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": { minHeight: 48 },
        }}
      >
        <Tab icon={<LocationOn />} label="Single" iconPosition="start" />
        <Tab icon={<StorageIcon />} label="Batch" iconPosition="start" />
        <Tab icon={<Straighten />} label="Geo Tools" iconPosition="start" />
      </Tabs>

      {encodeSubTab === 0 && (
        <EncodePanel
          encodeLat={encodeLat}
          setEncodeLat={setEncodeLat}
          encodeLng={encodeLng}
          setEncodeLng={setEncodeLng}
          encodeResult={encodeResult}
          encodeError={encodeError}
          locationName={locationName}
          loadingLocation={loadingLocation}
          selectedLocation={selectedLocation}
          invalidCoordinates={false} // Add validation logic if needed
          copied={copied}
          onEncode={encodeCoordinates}
          onCopy={handleCopy}
          onSaveFavorite={openSaveFavorite}
        />
      )}
      {encodeSubTab === 1 && (
        <BatchPanel
          batchInput={batchInput}
          setBatchInput={setBatchInput}
          batchResult={batchResult}
          batchError={batchError}
          onBatchEncode={handleBatchEncode}
          onBatchDecode={handleBatchDecode}
        />
      )}
      {encodeSubTab === 2 && (
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
      )}
    </Box>
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
      {/* Map is now the direct child of MainLayout (background) */}
      <MapplsMapView
        center={{ lat: mapCenter[0], lng: mapCenter[1] }}
        zoom={mapZoom}
        onClick={handleMapClick}
        onMapLoad={(map) => {
          setMapInstance(map);
        }}
      />

      {/* Floating Panel for Desktop (Hidden on Mobile) */}
      {!isMobile && (
        <FloatingPanel
          title={
            primaryTab === 0 ? "Encode Location" :
              primaryTab === 1 ? "Decode DIGIPIN" :
                "AI Assistant"
          }
        >
          <Box sx={{ p: 2 }}>
            {primaryTab === 0 && encodeContentView}
            {primaryTab === 1 && decodeContentView}
            {primaryTab === 2 && assistantContentView}
          </Box>
        </FloatingPanel>
      )}

      {/* Mobile Bottom Sheet (Visible on Mobile) */}
      {isMobile && (
        <MobileBottomSheet
          primaryTab={primaryTab}
          onPrimaryTabChange={(val) => handleTabChange({} as React.SyntheticEvent, val)}
          encodeContent={encodeContentView}
          decodeContent={decodeContentView}
          assistantContent={assistantContentView}
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Search Bar - Now positioned absolutely over map */}
      <Paper
        elevation={4}
        sx={{
          position: "absolute",
          top: 20,
          left: isMobile ? 20 : 440, // Align with floating header
          right: isMobile ? 20 : "auto",
          width: isMobile ? "auto" : 400,
          zIndex: 1000,
          borderRadius: "12px",
          background: "rgba(17, 17, 17, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          p: "2px 4px",
        }}
      >
        <IconButton sx={{ p: "10px", color: "text.secondary" }} aria-label="search">
          <Search />
        </IconButton>
        <Autocomplete
          freeSolo
          options={searchResults}
          getOptionLabel={(option) => (typeof option === "string" ? option : option.display_name)}
          renderOption={(props, option) => (
            <li {...props} key={option.place_id}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" noWrap>
                  {option.display_name}
                </Typography>
              </Box>
            </li>
          )}
          onInputChange={(_, value) => {
            setSearchQuery(value);
            handleSearch(value);
          }}
          onChange={(_, value) => {
            if (value && typeof value !== "string") {
              handleSearchSelect(value);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search places..."
              variant="standard"
              InputProps={{ ...params.InputProps, disableUnderline: true }}
              sx={{ ml: 1, flex: 1 }}
            />
          )}
          sx={{ flex: 1 }}
        />
        {loadingLocation && <CircularProgress size={20} sx={{ mr: 2 }} />}
      </Paper>

      {/* Floating Action Buttons */}
      <Box
        sx={{
          position: "absolute",
          bottom: isMobile ? 90 : 30,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          zIndex: 1000,
        }}
      >
        <Tooltip title="Current Location" placement="left">
          <Fab
            color="primary"
            onClick={getCurrentLocation}
            disabled={loadingLocation}
            sx={{
              background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
            }}
          >
            {loadingLocation ? <CircularProgress size={24} color="inherit" /> : <MyLocation />}
          </Fab>
        </Tooltip>

        <Tooltip title={measureEnabled ? "Clear Measurement" : "Measure Distance"} placement="left">
          <Fab
            color={measureEnabled ? "secondary" : "default"}
            onClick={() => {
              if (measureEnabled) {
                setMeasureEnabled(false);
                clearMeasurement();
              } else {
                setMeasureEnabled(true);
              }
            }}
            sx={{
              bgcolor: measureEnabled ? "secondary.main" : "background.paper",
              color: measureEnabled ? "white" : "text.primary",
            }}
          >
            {measureEnabled ? <Close /> : <Straighten />}
          </Fab>
        </Tooltip>

        <Tooltip title="Recenter Map" placement="left">
          <Fab
            size="small"
            onClick={() => {
              if (selectedLocation) {
                setMapCenter([selectedLocation.lat, selectedLocation.lng]);
              } else {
                setMapCenter([20.5937, 78.9629]);
              }
            }}
            sx={{ bgcolor: "background.paper" }}
          >
            <GpsFixed />
          </Fab>
        </Tooltip>
      </Box>

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
      {
        favoritesOpen && (
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
        )
      }

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
    </MainLayout >
  );
}

export default App;
