import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Autocomplete,
  Fab,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
  Collapse,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  MyLocation,
  Info,
  Search,
  LocationOn,
  ContentCopy,
  CheckCircle,
} from "@mui/icons-material";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  Rectangle,
} from "react-leaflet";
import L from "leaflet";
import {
  getDigiPin,
  getLatLngFromDigiPin,
  batchEncode,
  batchDecode,
  getDistance,
  findNearest,
} from "digipinjs";
import "./App.css";
import { MapTabPanel } from "./components/MapRouter";

// Fix default marker icon issue in leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#64b5f6", // Light blue
      light: "#9be7ff",
      dark: "#2286c3",
    },
    secondary: {
      main: "#81c784", // Light green
      light: "#b2fab4",
      dark: "#519657",
    },
    background: {
      default: "#0a0a0a",
      paper: "#1a1a1a",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(45, 45, 45, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(26, 26, 26, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
            "&.Mui-focused": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// India bounds - more precise boundaries
const indiaBounds: [[number, number], [number, number]] = [
  [6.5, 68.0], // Southwest (min lat, min lng)
  [37.1, 97.5], // Northeast (max lat, max lng)
];

// Additional validation function for India coordinates
const isWithinIndia = (lat: number, lng: number): boolean => {
  // Basic bounds check
  if (lat < 6.5 || lat > 37.1 || lng < 68.0 || lng > 97.5) {
    return false;
  }

  // Additional checks for specific regions that might be outside India
  // Exclude areas that are clearly not in India

  // Exclude areas north of Kashmir (Pakistan/China border)
  if (lat > 35.5 && lng > 74.0) {
    return false;
  }

  // Exclude areas in the northeast that might be in China/Myanmar
  if (lat > 28.0 && lng > 95.0) {
    return false;
  }

  // Exclude areas in the northwest that might be in Pakistan
  if (lat < 23.0 && lng < 70.0) {
    return false;
  }

  // Exclude areas in the far east that might be in Bangladesh
  if (lat < 22.0 && lng > 88.0) {
    return false;
  }

  return true;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Map controller component
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  React.useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);

  return null;
}

// Location selector component
function LocationSelector({
  setLat,
  setLng,
  setLocationName,
  setLocationLoading,
  setInvalidCoordinates,
  setInvalidClickLocation,
}: {
  setLat: (lat: string) => void;
  setLng: (lng: string) => void;
  setLocationName: (name: string) => void;
  setLocationLoading: (loading: boolean) => void;
  setInvalidCoordinates: (invalid: boolean) => void;
  setInvalidClickLocation: (location: [number, number] | null) => void;
}) {
  useMapEvents({
    click: async (e: any) => {
      const { lat, lng } = e.latlng;

      // Use the enhanced India validation function
      const coordinatesWithinIndia = isWithinIndia(lat, lng);

      if (coordinatesWithinIndia) {
        setInvalidCoordinates(false);
        setInvalidClickLocation(null);
        setLat(lat.toFixed(6));
        setLng(lng.toFixed(6));

        // Get location name
        setLocationLoading(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
          );
          const data = await response.json();
          if (data.display_name) {
            setLocationName(data.display_name);
          }
        } catch (error) {
          console.error("Error fetching location name:", error);
        } finally {
          setLocationLoading(false);
        }
      } else {
        // Show error for coordinates outside India
        setInvalidCoordinates(true);
        setInvalidClickLocation([lat, lng]);
        setLat("");
        setLng("");
        setLocationName("");

        // Remove the invalid marker after 3 seconds
        setTimeout(() => {
          setInvalidClickLocation(null);
        }, 3000);

        alert(
          "⚠️ Please select a location within India. DIGIPIN only works for Indian coordinates.\n\nIndia bounds: Latitude 6.5° to 37.1°, Longitude 68.0° to 97.5°"
        );
      }
    },
  });
  return null;
}

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [encodeLat, setEncodeLat] = useState("");
  const [encodeLng, setEncodeLng] = useState("");
  const [encodeResult, setEncodeResult] = useState("");
  const [encodeError, setEncodeError] = useState("");
  const [decodeDigipin, setDecodeDigipin] = useState("");
  const [decodeResult, setDecodeResult] = useState<Location | null>(null);
  const [decodeError, setDecodeError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [locationName, setLocationName] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    20.5937, 78.9629,
  ]); // Center of India
  const [invalidCoordinates, setInvalidCoordinates] = useState(false);
  const [invalidClickLocation, setInvalidClickLocation] = useState<
    [number, number] | null
  >(null);

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if(newValue!==3){
      setGeoDistance(null);
    }
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

      // Use the enhanced India validation function
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
    } catch (error) {
      setEncodeError("Error encoding coordinates");
    }
  };

  const decodeDigipinCode = () => {
    try {
      setDecodeError("");
      const coordinates = getLatLngFromDigiPin(decodeDigipin);
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
    } catch (error) {
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
      if (data.display_name) {
        setLocationName(data.display_name);
      }
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
          const { latitude, longitude } = position.coords;
          if (isWithinIndia(latitude, longitude)) {
            setSelectedLocation({ lat: latitude, lng: longitude });
            setEncodeLat(latitude.toFixed(6));
            setEncodeLng(longitude.toFixed(6));
            setMapCenter([latitude, longitude]);
            fetchLocationName(latitude, longitude);
          } else {
            alert(
              "⚠️ Your current location is outside India. DIGIPIN only works for Indian coordinates."
            );
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
      alert(
        "⚠️ This location is outside India. DIGIPIN only works for Indian coordinates."
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
      // Expecting lines as lat,lng
      const coords = lines.map((line) => {
        const [lat, lng] = line.split(/\s*[, ]\s*/);
        return { lat: parseFloat(lat), lng: parseFloat(lng) };
      });
      if (coords.some((c) => isNaN(c.lat) || isNaN(c.lng))) {
        setBatchError(
          "Invalid coordinates format. Use: lat,lng per line or comma separated."
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
    } catch (e) {
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
        coords.map((coord, i) => ({
          input: pins[i],
          result: coord
            ? `${coord.latitude},${coord.longitude}`
            : "Invalid DIGIPIN",
        }))
      );
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
      setNearestError("Error finding nearest DIGIPIN.");
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchPlaces(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobilePanelOpen] = useState(true);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div
        className="App"
        style={{ backgroundColor: "#0a0a0a", minHeight: "100vh" }}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, color: "#64b5f6", fontWeight: "bold" }}
            >
              DIGIPIN Explorer
            </Typography>
            <IconButton
              onClick={() => setInfoOpen(true)}
              sx={{ color: "#64b5f6" }}
            >
              <Info />
            </IconButton>
          </Toolbar>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{ backgroundColor: "rgba(100, 181, 246, 0.1)" }}
          >
            <Tab label="Encode" sx={{ color: "#64b5f6" }} />
            <Tab label="Decode" sx={{ color: "#64b5f6" }} />
            <Tab label="Batch" sx={{ color: "#64b5f6" }} />
            <Tab label="Geo Utilities" sx={{ color: "#64b5f6" }} />
          </Tabs>
        </AppBar>

        {isMobile ? (
          // MOBILE: Controls on top, map below, collapsible
          <Box sx={{ width: "100vw", maxWidth: "100vw", p: 0, m: 0 }}>
            {/* Toggle button/bar */}
            <Collapse in={mobilePanelOpen} timeout="auto" unmountOnExit>
              <Box
                sx={{
                  width: "100vw",
                  maxWidth: "100vw",
                  borderRadius: 0,
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "background.paper",
                  mb: 0,
                  p: 0,
                  maxHeight: "60vh",
                  overflowY: "auto",
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{ backgroundColor: "rgba(100, 181, 246, 0.1)" }}
                >
                  <Tab
                    icon={<LocationOn />}
                    label="Encode"
                    iconPosition="start"
                    sx={{ color: "#64b5f6" }}
                  />
                  <Tab
                    icon={<Search />}
                    label="Decode"
                    iconPosition="start"
                    sx={{ color: "#64b5f6" }}
                  />
                  <Tab label="Batch" sx={{ color: "#64b5f6" }} />
                  <Tab label="Geo Utilities" sx={{ color: "#64b5f6" }} />
                </Tabs>
                {/* Encode Tab */}
                <TabPanel value={activeTab} index={0}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "#ffffff" }}
                    >
                      Convert Coordinates to DIGIPIN
                    </Typography>

                    {/* Invalid Coordinates Warning */}
                    {invalidCoordinates && (
                      <Alert
                        severity="warning"
                        sx={{
                          backgroundColor: "rgba(255, 152, 0, 0.1)",
                          border: "1px solid rgba(255, 152, 0, 0.3)",
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          ⚠️ Invalid Location Selected
                        </Typography>
                        <Typography variant="body2">
                          Please click within the blue boundary (India) on the
                          map to select valid coordinates.
                        </Typography>
                      </Alert>
                    )}

                    {/* Location Name Display */}
                    {locationName && (
                      <Alert
                        severity="info"
                        icon={<LocationOn />}
                        sx={{ backgroundColor: "rgba(100, 181, 246, 0.1)" }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          Selected Location:
                        </Typography>
                        <Typography variant="body2">{locationName}</Typography>
                      </Alert>
                    )}

                    {loadingLocation && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 1,
                        }}
                      >
                        <CircularProgress size={16} sx={{ color: "#64b5f6" }} />
                        <Typography variant="body2" color="text.secondary">
                          Getting location name...
                        </Typography>
                      </Box>
                    )}

                    <TextField
                      label="Latitude"
                      placeholder="e.g., 28.6139"
                      value={encodeLat}
                      onChange={(e) => setEncodeLat(e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />

                    <TextField
                      label="Longitude"
                      placeholder="e.g., 77.2090"
                      value={encodeLng}
                      onChange={(e) => setEncodeLng(e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />

                    <Button
                      variant="contained"
                      onClick={encodeCoordinates}
                      fullWidth
                      sx={{
                        mt: 1,
                        backgroundColor: "#64b5f6",
                        "&:hover": { backgroundColor: "#42a5f5" },
                      }}
                    >
                      Generate DIGIPIN
                    </Button>

                    {encodeResult && (
                      <Alert
                        severity="success"
                        sx={{
                          mt: 2,
                          backgroundColor: "rgba(129, 199, 132, 0.1)",
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          DIGIPIN Generated:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <Chip
                            label={encodeResult}
                            color="primary"
                            variant="filled"
                            sx={{
                              fontSize: "1.1rem",
                              fontWeight: "bold",
                              backgroundColor: "#64b5f6",
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(encodeResult)}
                            sx={{ color: "#64b5f6" }}
                          >
                            {copied ? <CheckCircle /> : <ContentCopy />}
                          </IconButton>
                        </Box>
                      </Alert>
                    )}

                    {encodeError && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {encodeError}
                      </Alert>
                    )}
                  </Box>
                </TabPanel>

                {/* Decode Tab */}
                <TabPanel value={activeTab} index={1}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "#ffffff" }}
                    >
                      Convert DIGIPIN to Coordinates
                    </Typography>

                    <TextField
                      label="DIGIPIN"
                      placeholder="e.g., 39J-438-TJC7"
                      value={decodeDigipin}
                      onChange={(e) => setDecodeDigipin(e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />

                    <Button
                      variant="contained"
                      onClick={decodeDigipinCode}
                      fullWidth
                      sx={{
                        mt: 1,
                        backgroundColor: "#64b5f6",
                        "&:hover": { backgroundColor: "#42a5f5" },
                      }}
                    >
                      Decode Coordinates
                    </Button>

                    {decodeResult && (
                      <Alert
                        severity="success"
                        sx={{
                          mt: 2,
                          backgroundColor: "rgba(129, 199, 132, 0.1)",
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          Coordinates Found:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <Chip
                            label={`Latitude: ${decodeResult.lat}`}
                            color="primary"
                            variant="outlined"
                            icon={<LocationOn />}
                            sx={{ borderColor: "#64b5f6", color: "#64b5f6" }}
                          />
                          <Chip
                            label={`Longitude: ${decodeResult.lng}`}
                            color="primary"
                            variant="outlined"
                            icon={<LocationOn />}
                            sx={{ borderColor: "#64b5f6", color: "#64b5f6" }}
                          />
                        </Box>
                      </Alert>
                    )}

                    {decodeError && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {decodeError}
                      </Alert>
                    )}
                  </Box>
                </TabPanel>

                {/* Batch Tab */}
                <TabPanel value={activeTab} index={2}>
                  {/* Batch Tab: Only batch encode/decode UI, no geo utilities */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                      width: "100%",
                      maxWidth: { xs: "100vw", sm: 600 },
                      mx: "auto",
                      p: { xs: 1, sm: 2 },
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "#ffffff" }}>
                      Batch Encode / Decode
                    </Typography>
                    <TextField
                      label="Input (lat,lng per line or DIGIPIN per line)"
                      placeholder={
                        "28.6139,77.2090\n19.0760,72.8777\nor\n39J-438-TJC7\n4FK-595-8823"
                      }
                      value={batchInput}
                      onChange={(e) => setBatchInput(e.target.value)}
                      multiline
                      minRows={4}
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={handleBatchEncode}
                        sx={{
                          backgroundColor: "#64b5f6",
                          width: { xs: "100%", sm: "fit-content" },
                        }}
                      >
                        Batch Encode
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleBatchDecode}
                        sx={{
                          backgroundColor: "#64b5f6",
                          width: { xs: "100%", sm: "fit-content" },
                        }}
                      >
                        Batch Decode
                      </Button>
                    </Box>
                    {batchError && <Alert severity="error">{batchError}</Alert>}
                    {batchResult.length > 0 && (
                      <Box sx={{ overflowX: "auto" }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#ffffff" }}
                        >
                          Results:
                        </Typography>
                        <Paper
                          sx={{
                            mt: 1,
                            p: 1,
                            backgroundColor: "rgba(100,181,246,0.05)",
                            width: "100%",
                            minWidth: 0,
                          }}
                        >
                          <table
                            style={{
                              width: "100%",
                              color: "#fff",
                              fontSize: "0.95rem",
                              wordBreak: "break-all",
                            }}
                          >
                            <thead>
                              <tr>
                                <th style={{ textAlign: "left" }}>Input</th>
                                <th style={{ textAlign: "left" }}>Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              {batchResult.map((row, i) => (
                                <tr key={i}>
                                  <td>{row.input}</td>
                                  <td>
                                    {typeof row.result === "string"
                                      ? row.result
                                      : JSON.stringify(row.result)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                </TabPanel>

                {/* Geo Utilities Tab */}
                <TabPanel value={activeTab} index={3}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                      width: "100%",
                      maxWidth: { xs: "100vw", sm: 600 },
                      mx: "auto",
                      p: { xs: 1, sm: 2 },
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "#ffffff" }}>
                      Geo Utilities
                    </Typography>

                    {/* Distance between DIGIPINs */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: "#ffffff" }}>
                        Distance Between Two DIGIPINs
                      </Typography>
                      <TextField
                        label="DIGIPIN A"
                        value={geoPinA}
                        onChange={(e) => setGeoPinA(e.target.value)}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="DIGIPIN B"
                        value={geoPinB}
                        onChange={(e) => setGeoPinB(e.target.value)}
                        size="small"
                        fullWidth
                      />
                      <Button
                        variant="contained"
                        onClick={handleGeoDistance}
                        sx={{
                          backgroundColor: "#64b5f6",
                          width: { xs: "100%", sm: "fit-content" },
                          alignSelf: { xs: "stretch", sm: "flex-start" },
                        }}
                      >
                        Calculate Distance
                      </Button>
                      {geoDistanceError && (
                        <Alert severity="error">{geoDistanceError}</Alert>
                      )}
                      {geoDistance !== null && (
                        <Alert severity="info">
                          Distance: {geoDistance} meters
                        </Alert>
                      )}
                    </Box>

                
                    {/* Nearest DIGIPIN */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mt: 3,
                        width: "100%",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: "#ffffff" }}>
                        Find Nearest DIGIPIN
                      </Typography>
                      <TextField
                        label="Base DIGIPIN"
                        value={nearestBasePin}
                        onChange={(e) => setNearestBasePin(e.target.value)}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="List of DIGIPINs (comma or line separated)"
                        value={nearestList}
                        onChange={(e) => setNearestList(e.target.value)}
                        size="small"
                        multiline
                        minRows={2}
                        fullWidth
                      />
                      <Button
                        variant="contained"
                        onClick={handleFindNearest}
                        sx={{
                          backgroundColor: "#64b5f6",
                          width: { xs: "100%", sm: "fit-content" },
                          alignSelf: { xs: "stretch", sm: "flex-start" },
                        }}
                      >
                        Find Nearest
                      </Button>
                      {nearestError && (
                        <Alert severity="error">{nearestError}</Alert>
                      )}
                      {nearestResult && (
                        <Alert severity="info">
                          Nearest DIGIPIN: {nearestResult}
                        </Alert>
                      )}
                    </Box>
                  </Box>
                </TabPanel>
              </Box>
            </Collapse>
            <Box
              sx={{
                width: "100vw",
                height: mobilePanelOpen ? "40vh" : "calc(100vh - 56px)",
                minHeight: 200,
                maxHeight: mobilePanelOpen ? "40vh" : "calc(100vh - 56px)",
                position: "relative",
                mt: 0,
                transition: "height 0.3s",
              }}
            >
              {(geoPinA && geoPinB) ? (
                      <MapTabPanel geoPinA={geoPinA} geoPinB={geoPinB} />
                    ) : (
                      <MapContainer
                center={mapCenter}
                zoom={5}
                style={{ height: "100%", width: "100%", minHeight: 400 }}
                minZoom={4}
                maxBounds={indiaBounds}
                maxBoundsViscosity={1.0}
                bounds={indiaBounds}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  // @ts-ignore: attribution is a valid prop for TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                />

                {/* India boundary overlay */}
                <Rectangle
                  bounds={indiaBounds}
                  pathOptions={{
                    color: "#64b5f6",
                    weight: 2,
                    fillColor: "#64b5f6",
                    fillOpacity: 0.1,
                    dashArray: "5, 5",
                  }}
                />

                <LocationSelector
                  setLat={setEncodeLat}
                  setLng={setEncodeLng}
                  setLocationName={setLocationName}
                  setLocationLoading={setLoadingLocation}
                  setInvalidCoordinates={setInvalidCoordinates}
                  setInvalidClickLocation={setInvalidClickLocation}
                />
                {selectedLocation && (
                  <Marker
                    position={[selectedLocation.lat, selectedLocation.lng]}
                  />
                )}
                {invalidClickLocation && (
                  <Marker
                    position={invalidClickLocation}
                    icon={L.divIcon({
                      className: "invalid-marker",
                      html: '<div style="background-color: #f44336; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
                      iconSize: [20, 20],
                      iconAnchor: [10, 10],
                    })}
                  />
                )}
                <MapController center={mapCenter} />
              </MapContainer>
                    )}
            </Box>
          </Box>
        ) : (
          // DESKTOP: Two-column layout, panel fixed right, map left
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              height: "calc(100vh - 64px)",
              width: "100vw",
            }}
          >
            {/* Map area */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                height: "100%",
                minHeight: 400,
                position: "relative",
              }}
            >
            {geoDistance ? (
                      <MapTabPanel geoPinA={geoPinA} geoPinB={geoPinB} />
                    ) : (
                      <MapContainer
                center={mapCenter}
                zoom={5}
                style={{ height: "100%", width: "100%", minHeight: 400 }}
                minZoom={4}
                maxBounds={indiaBounds}
                maxBoundsViscosity={1.0}
                bounds={indiaBounds}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  // @ts-ignore: attribution is a valid prop for TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                />

                {/* India boundary overlay */}
                <Rectangle
                  bounds={indiaBounds}
                  pathOptions={{
                    color: "#64b5f6",
                    weight: 2,
                    fillColor: "#64b5f6",
                    fillOpacity: 0.1,
                    dashArray: "5, 5",
                  }}
                />

                <LocationSelector
                  setLat={setEncodeLat}
                  setLng={setEncodeLng}
                  setLocationName={setLocationName}
                  setLocationLoading={setLoadingLocation}
                  setInvalidCoordinates={setInvalidCoordinates}
                  setInvalidClickLocation={setInvalidClickLocation}
                />
                {selectedLocation && (
                  <Marker
                    position={[selectedLocation.lat, selectedLocation.lng]}
                  />
                )}
                {invalidClickLocation && (
                  <Marker
                    position={invalidClickLocation}
                    icon={L.divIcon({
                      className: "invalid-marker",
                      html: '<div style="background-color: #f44336; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
                      iconSize: [20, 20],
                      iconAnchor: [10, 10],
                    })}
                  />
                )}
                <MapController center={mapCenter} />
              </MapContainer>
                    )}
            
              
            </Box>
            {/* Control panel */}
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
              }}
            >
              <Box
                sx={{ width: "100%", height: "100%", overflowY: "auto", p: 0 }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{ backgroundColor: "rgba(100, 181, 246, 0.1)" }}
                >
                  <Tab
                    icon={<LocationOn />}
                    label="Encode"
                    iconPosition="start"
                    sx={{ color: "#64b5f6" }}
                  />
                  <Tab
                    icon={<Search />}
                    label="Decode"
                    iconPosition="start"
                    sx={{ color: "#64b5f6" }}
                  />
                  <Tab label="Batch" sx={{ color: "#64b5f6" }} />
                  <Tab label="Geo Utilities" sx={{ color: "#64b5f6" }} />
                </Tabs>
                {/* Encode Tab */}
                <TabPanel value={activeTab} index={0}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "#ffffff" }}
                    >
                      Convert Coordinates to DIGIPIN
                    </Typography>

                    {/* Invalid Coordinates Warning */}
                    {invalidCoordinates && (
                      <Alert
                        severity="warning"
                        sx={{
                          backgroundColor: "rgba(255, 152, 0, 0.1)",
                          border: "1px solid rgba(255, 152, 0, 0.3)",
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          ⚠️ Invalid Location Selected
                        </Typography>
                        <Typography variant="body2">
                          Please click within the blue boundary (India) on the
                          map to select valid coordinates.
                        </Typography>
                      </Alert>
                    )}

                    {/* Location Name Display */}
                    {locationName && (
                      <Alert
                        severity="info"
                        icon={<LocationOn />}
                        sx={{ backgroundColor: "rgba(100, 181, 246, 0.1)" }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          Selected Location:
                        </Typography>
                        <Typography variant="body2">{locationName}</Typography>
                      </Alert>
                    )}

                    {loadingLocation && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 1,
                        }}
                      >
                        <CircularProgress size={16} sx={{ color: "#64b5f6" }} />
                        <Typography variant="body2" color="text.secondary">
                          Getting location name...
                        </Typography>
                      </Box>
                    )}

                    <TextField
                      label="Latitude"
                      placeholder="e.g., 28.6139"
                      value={encodeLat}
                      onChange={(e) => setEncodeLat(e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />

                    <TextField
                      label="Longitude"
                      placeholder="e.g., 77.2090"
                      value={encodeLng}
                      onChange={(e) => setEncodeLng(e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />

                    <Button
                      variant="contained"
                      onClick={encodeCoordinates}
                      fullWidth
                      sx={{
                        mt: 1,
                        backgroundColor: "#64b5f6",
                        "&:hover": { backgroundColor: "#42a5f5" },
                      }}
                    >
                      Generate DIGIPIN
                    </Button>

                    {encodeResult && (
                      <Alert
                        severity="success"
                        sx={{
                          mt: 2,
                          backgroundColor: "rgba(129, 199, 132, 0.1)",
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          DIGIPIN Generated:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <Chip
                            label={encodeResult}
                            color="primary"
                            variant="filled"
                            sx={{
                              fontSize: "1.1rem",
                              fontWeight: "bold",
                              backgroundColor: "#64b5f6",
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(encodeResult)}
                            sx={{ color: "#64b5f6" }}
                          >
                            {copied ? <CheckCircle /> : <ContentCopy />}
                          </IconButton>
                        </Box>
                      </Alert>
                    )}

                    {encodeError && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {encodeError}
                      </Alert>
                    )}
                  </Box>
                </TabPanel>

                {/* Decode Tab */}
                <TabPanel value={activeTab} index={1}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "#ffffff" }}
                    >
                      Convert DIGIPIN to Coordinates
                    </Typography>

                    <TextField
                      label="DIGIPIN"
                      placeholder="e.g., 39J-438-TJC7"
                      value={decodeDigipin}
                      onChange={(e) => setDecodeDigipin(e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />

                    <Button
                      variant="contained"
                      onClick={decodeDigipinCode}
                      fullWidth
                      sx={{
                        mt: 1,
                        backgroundColor: "#64b5f6",
                        "&:hover": { backgroundColor: "#42a5f5" },
                      }}
                    >
                      Decode Coordinates
                    </Button>

                    {decodeResult && (
                      <Alert
                        severity="success"
                        sx={{
                          mt: 2,
                          backgroundColor: "rgba(129, 199, 132, 0.1)",
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          Coordinates Found:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <Chip
                            label={`Latitude: ${decodeResult.lat}`}
                            color="primary"
                            variant="outlined"
                            icon={<LocationOn />}
                            sx={{ borderColor: "#64b5f6", color: "#64b5f6" }}
                          />
                          <Chip
                            label={`Longitude: ${decodeResult.lng}`}
                            color="primary"
                            variant="outlined"
                            icon={<LocationOn />}
                            sx={{ borderColor: "#64b5f6", color: "#64b5f6" }}
                          />
                        </Box>
                      </Alert>
                    )}

                    {decodeError && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {decodeError}
                      </Alert>
                    )}
                  </Box>
                </TabPanel>

                {/* Batch Tab */}
                <TabPanel value={activeTab} index={2}>
                  {/* Batch Tab: Only batch encode/decode UI, no geo utilities */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                      width: "100%",
                      maxWidth: { xs: "100vw", sm: 600 },
                      mx: "auto",
                      p: { xs: 1, sm: 2 },
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "#ffffff" }}>
                      Batch Encode / Decode
                    </Typography>
                    <TextField
                      label="Input (lat,lng per line or DIGIPIN per line)"
                      placeholder={
                        "28.6139,77.2090\n19.0760,72.8777\nor\n39J-438-TJC7\n4FK-595-8823"
                      }
                      value={batchInput}
                      onChange={(e) => setBatchInput(e.target.value)}
                      multiline
                      minRows={4}
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={handleBatchEncode}
                        sx={{
                          backgroundColor: "#64b5f6",
                          width: { xs: "100%", sm: "fit-content" },
                        }}
                      >
                        Batch Encode
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleBatchDecode}
                        sx={{
                          backgroundColor: "#64b5f6",
                          width: { xs: "100%", sm: "fit-content" },
                        }}
                      >
                        Batch Decode
                      </Button>
                    </Box>
                    {batchError && <Alert severity="error">{batchError}</Alert>}
                    {batchResult.length > 0 && (
                      <Box sx={{ overflowX: "auto" }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#ffffff" }}
                        >
                          Results:
                        </Typography>
                        <Paper
                          sx={{
                            mt: 1,
                            p: 1,
                            backgroundColor: "rgba(100,181,246,0.05)",
                            width: "100%",
                            minWidth: 0,
                          }}
                        >
                          <table
                            style={{
                              width: "100%",
                              color: "#fff",
                              fontSize: "0.95rem",
                              wordBreak: "break-all",
                            }}
                          >
                            <thead>
                              <tr>
                                <th style={{ textAlign: "left" }}>Input</th>
                                <th style={{ textAlign: "left" }}>Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              {batchResult.map((row, i) => (
                                <tr key={i}>
                                  <td>{row.input}</td>
                                  <td>
                                    {typeof row.result === "string"
                                      ? row.result
                                      : JSON.stringify(row.result)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                </TabPanel>

                {/* Geo Utilities Tab */}
                <TabPanel value={activeTab} index={3}>
                  {/* Geo Utilities Tab */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                      width: "100%",
                      maxWidth: { xs: "100vw", sm: 600 },
                      mx: "auto",
                      p: { xs: 1, sm: 2 },
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "#ffffff" }}>
                      Geo Utilities
                    </Typography>

                    {/* Distance Between DIGIPINs */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: "#ffffff" }}>
                        Distance Between Two DIGIPINs
                      </Typography>
                      <TextField
                        label="DIGIPIN A"
                        value={geoPinA}
                        onChange={(e) => setGeoPinA(e.target.value)}
                        size="small"
                        fullWidth
                        sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
                      />
                      <TextField
                        label="DIGIPIN B"
                        value={geoPinB}
                        onChange={(e) => setGeoPinB(e.target.value)}
                        size="small"
                        fullWidth
                        sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleGeoDistance}
                        sx={{
                          backgroundColor: "#64b5f6",
                          width: { xs: "100%", sm: "fit-content" },
                          alignSelf: { xs: "stretch", sm: "flex-start" },
                        }}
                      >
                        Calculate Distance
                      </Button>

                      {geoDistanceError && (
                        <Alert severity="error">{geoDistanceError}</Alert>
                      )}
                      {geoDistance !== null && (
                        <Alert severity="info">
                          Distance: {geoDistance} meters
                        </Alert>
                      )}
                    </Box>

                    

                    {/* Find Nearest DIGIPIN */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mt: 3,
                        width: "100%",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: "#9b7878ff" }}>
                        Find Nearest DIGIPIN
                      </Typography>
                      <TextField
                        label="Base DIGIPIN"
                        value={nearestBasePin}
                        onChange={(e) => setNearestBasePin(e.target.value)}
                        size="small"
                        fullWidth
                        sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
                      />
                      <TextField
                        label="List of DIGIPINs (comma or line separated)"
                        value={nearestList}
                        onChange={(e) => setNearestList(e.target.value)}
                        size="small"
                        multiline
                        minRows={2}
                        fullWidth
                        sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleFindNearest}
                        sx={{
                          backgroundColor: "#64b5f6",
                          width: { xs: "100%", sm: "fit-content" },
                          alignSelf: { xs: "stretch", sm: "flex-start" },
                        }}
                      >
                        Find Nearest
                      </Button>
                      {nearestError && (
                        <Alert severity="error">{nearestError}</Alert>
                      )}
                      {nearestResult && (
                        <Alert severity="info">
                          Nearest DIGIPIN: {nearestResult}
                        </Alert>
                      )}
                    </Box>
                  </Box>
                </TabPanel>
              </Box>
            </Box>
          </Box>
        )}

        {/* Search Bar */}
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            width: 350,
            zIndex: 3,
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Autocomplete
              freeSolo
              options={searchResults}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.display_name
              }
              inputValue={searchQuery}
              onInputChange={(event, newInputValue) => {
                setSearchQuery(newInputValue);
              }}
              onChange={(event, newValue) => {
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
                    startAdornment: (
                      <Search sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                    endAdornment: (
                      <>
                        {searching ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
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

        {/* Floating Action Button for Current Location */}
        <Fab
          color="primary"
          aria-label="current location"
          sx={{
            position: "absolute",
            bottom: 20,
            left: 20,
            zIndex: 3,
            backgroundColor: "#64b5f6",
            "&:hover": { backgroundColor: "#42a5f5" },
          }}
          onClick={getCurrentLocation}
        >
          <MyLocation />
        </Fab>

        {/* Info Dialog */}
        <Dialog
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: "#ffffff" }}>
            About DIGIPIN
            <IconButton
              aria-label="close"
              onClick={() => setInfoOpen(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "#64b5f6",
              }}
            >
              <Info />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography paragraph sx={{ color: "#ffffff" }}>
              DIGIPIN (Digital Postal Index Number) is a geocoding system for
              India that converts latitude and longitude coordinates into a
              unique alphanumeric code.
            </Typography>
            <Typography paragraph sx={{ color: "#ffffff" }}>
              <strong>Features:</strong>
            </Typography>
            <ul style={{ color: "#b0b0b0" }}>
              <li>Search for places in India and navigate directly to them</li>
              <li>Click anywhere on the map of India to select coordinates</li>
              <li>Get location names automatically using reverse geocoding</li>
              <li>
                Use the current location button to get your exact position
              </li>
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
            <Button
              onClick={() => setInfoOpen(false)}
              sx={{ color: "#64b5f6" }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}

export default App;
