import React from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    IconButton,
    Tooltip,
    CircularProgress,
    Paper,
    Stack,
    Divider,
    Fade,
} from "@mui/material";
import {
    LocationOn,
    ContentCopy,
    CheckCircle,
    Link as LinkIcon,
} from "@mui/icons-material";
import { Location } from "../../types";

interface EncodePanelProps {
    encodeLat: string;
    setEncodeLat: (val: string) => void;
    encodeLng: string;
    setEncodeLng: (val: string) => void;
    encodeResult: string;
    encodeError: string;
    onEncode: () => void;
    onSaveFavorite: () => void;
    invalidCoordinates: boolean;
    locationName: string;
    loadingLocation: boolean;
    selectedLocation: Location | null;
    copied: boolean;
    onCopy: (text: string) => void;
}

export const EncodePanel: React.FC<EncodePanelProps> = ({
    encodeLat,
    setEncodeLat,
    encodeLng,
    setEncodeLng,
    encodeResult,
    encodeError,
    onEncode,
    onSaveFavorite,
    invalidCoordinates,
    locationName,
    loadingLocation,
    selectedLocation,
    copied,
    onCopy,
}) => {
    // Helper for QR code
    const QrImg = ({ value, size = 100 }: { value: string; size?: number }) => {
        const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
            value
        )}`;
        return (
            <Box
                sx={{
                    p: 1,
                    bgcolor: "white",
                    borderRadius: 2,
                    display: "inline-block",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
            >
                <img src={src} width={size} height={size} alt="QR code" style={{ display: "block" }} />
            </Box>
        );
    };

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ background: "linear-gradient(45deg, #3B82F6, #60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Encode Location
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Convert latitude and longitude coordinates into a unique DIGIPIN.
                </Typography>
            </Box>

            <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Stack spacing={2}>
                    {invalidCoordinates && (
                        <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
                            Invalid coordinates. Please select a location within India.
                        </Alert>
                    )}

                    {locationName && (
                        <Fade in>
                            <Alert
                                icon={<LocationOn fontSize="inherit" />}
                                severity="info"
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    "& .MuiAlert-message": { width: "100%" },
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Selected Location
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {locationName}
                                </Typography>
                            </Alert>
                        </Fade>
                    )}

                    {loadingLocation && (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1 }}>
                            <CircularProgress size={16} thickness={5} />
                            <Typography variant="caption" color="text.secondary">
                                Fetching address details...
                            </Typography>
                        </Stack>
                    )}

                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Latitude"
                            placeholder="28.6139"
                            value={encodeLat}
                            onChange={(e) => setEncodeLat(e.target.value)}
                            fullWidth
                            variant="outlined"
                            inputMode="decimal"
                            type="number"
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                        <TextField
                            label="Longitude"
                            placeholder="77.2090"
                            value={encodeLng}
                            onChange={(e) => setEncodeLng(e.target.value)}
                            fullWidth
                            variant="outlined"
                            inputMode="decimal"
                            type="number"
                            InputProps={{ sx: { borderRadius: 3 } }}
                        />
                    </Stack>

                    <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                        <Button
                            variant="contained"
                            onClick={onEncode}
                            fullWidth
                            size="large"
                            sx={{ borderRadius: 3, py: 1.5, fontSize: "1.1rem", textTransform: "none" }}
                        >
                            Generate DIGIPIN
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={onSaveFavorite}
                            disabled={!encodeResult}
                            sx={{ borderRadius: 3, minWidth: 100, py: 1.5 }}
                        >
                            Save
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            {encodeResult && (
                <Fade in timeout={500}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                        }}
                    >
                        <Stack spacing={2} alignItems="center">
                            <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ letterSpacing: 1 }}>
                                GENERATED DIGIPIN
                            </Typography>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: 2, color: "#fff", textShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}>
                                    {encodeResult}
                                </Typography>
                                <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                                    <IconButton onClick={() => onCopy(encodeResult)} color="primary" sx={{ bgcolor: "rgba(59, 130, 246, 0.1)", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.2)" } }}>
                                        {copied ? <CheckCircle /> : <ContentCopy />}
                                    </IconButton>
                                </Tooltip>
                            </Stack>

                            <Divider flexItem sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

                            {selectedLocation && (
                                <Stack direction="row" spacing={3} alignItems="center" sx={{ width: "100%", justifyContent: "center" }}>
                                    <Box>
                                        <QrImg value={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`} />
                                    </Box>
                                    <Stack spacing={1}>
                                        <Button
                                            variant="text"
                                            startIcon={<LocationOn />}
                                            href={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`}
                                            target="_blank"
                                            sx={{ justifyContent: "flex-start", color: "text.primary" }}
                                        >
                                            Open in Maps
                                        </Button>
                                        <Button
                                            variant="text"
                                            startIcon={<LinkIcon />}
                                            onClick={() => navigator.clipboard.writeText(`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`)}
                                            sx={{ justifyContent: "flex-start", color: "text.primary" }}
                                        >
                                            Copy Link
                                        </Button>
                                    </Stack>
                                </Stack>
                            )}
                        </Stack>
                    </Paper>
                </Fade>
            )}

            {encodeError && (
                <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                    {encodeError}
                </Alert>
            )}
        </Stack>
    );
};
