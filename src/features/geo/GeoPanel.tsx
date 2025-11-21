import React from "react";
import { Box, Typography, TextField, Button, Alert, Paper, Stack } from "@mui/material";
import { Straighten, NearMe } from "@mui/icons-material";

interface GeoPanelProps {
    geoPinA: string;
    setGeoPinA: (val: string) => void;
    geoPinB: string;
    setGeoPinB: (val: string) => void;
    geoDistance: number | null;
    geoDistanceError: string;
    onCalculateDistance: () => void;
    nearestBasePin: string;
    setNearestBasePin: (val: string) => void;
    nearestList: string;
    setNearestList: (val: string) => void;
    nearestResult: string | null;
    nearestError: string;
    onFindNearest: () => void;
}

export const GeoPanel: React.FC<GeoPanelProps> = ({
    geoPinA,
    setGeoPinA,
    geoPinB,
    setGeoPinB,
    geoDistance,
    geoDistanceError,
    onCalculateDistance,
    nearestBasePin,
    setNearestBasePin,
    nearestList,
    setNearestList,
    nearestResult,
    nearestError,
    onFindNearest,
}) => {
    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ background: "linear-gradient(45deg, #3B82F6, #60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Geo Utilities
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Calculate distances and find nearest locations using DIGIPINs.
                </Typography>
            </Box>

            <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Stack spacing={2}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Straighten fontSize="small" color="primary" />
                        Distance Calculator
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="DIGIPIN A"
                            value={geoPinA}
                            onChange={(e) => setGeoPinA(e.target.value)}
                            size="small"
                            fullWidth
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        <TextField
                            label="DIGIPIN B"
                            value={geoPinB}
                            onChange={(e) => setGeoPinB(e.target.value)}
                            size="small"
                            fullWidth
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                    </Stack>
                    <Button
                        variant="contained"
                        onClick={onCalculateDistance}
                        fullWidth
                        sx={{ borderRadius: 3 }}
                    >
                        Calculate Distance
                    </Button>

                    {geoDistanceError && <Alert severity="error" variant="outlined">{geoDistanceError}</Alert>}
                    {geoDistance !== null && (
                        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
                            Distance: <strong>{geoDistance < 1000 ? `${geoDistance} m` : `${(geoDistance / 1000).toFixed(2)} km`}</strong>
                        </Alert>
                    )}
                </Stack>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Stack spacing={2}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <NearMe fontSize="small" color="secondary" />
                        Find Nearest DIGIPIN
                    </Typography>
                    <TextField
                        label="Base DIGIPIN"
                        value={nearestBasePin}
                        onChange={(e) => setNearestBasePin(e.target.value)}
                        size="small"
                        fullWidth
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 2 } }}
                    />
                    <TextField
                        label="List of DIGIPINs"
                        placeholder="Comma or line separated"
                        value={nearestList}
                        onChange={(e) => setNearestList(e.target.value)}
                        size="small"
                        multiline
                        minRows={3}
                        fullWidth
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 2 } }}
                    />
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={onFindNearest}
                        fullWidth
                        sx={{ borderRadius: 3 }}
                    >
                        Find Nearest
                    </Button>

                    {nearestError && <Alert severity="error" variant="outlined">{nearestError}</Alert>}
                    {nearestResult && (
                        <Alert severity="success" variant="filled" sx={{ borderRadius: 2, bgcolor: "secondary.main" }}>
                            Nearest: <strong>{nearestResult}</strong>
                        </Alert>
                    )}
                </Stack>
            </Paper>
        </Stack>
    );
};
