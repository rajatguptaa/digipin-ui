import React from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Chip,
    IconButton,
    Tooltip,
    Paper,
    Stack,
    Fade,
    Divider,
} from "@mui/material";
import { LocationOn, Link as LinkIcon, ContentCopy, CheckCircle } from "@mui/icons-material";
import { Location } from "../../types";

interface DecodePanelProps {
    decodeDigipin: string;
    setDecodeDigipin: (val: string) => void;
    decodeResult: Location | null;
    decodeError: string;
    onDecode: () => void;
}

export const DecodePanel: React.FC<DecodePanelProps> = ({
    decodeDigipin,
    setDecodeDigipin,
    decodeResult,
    decodeError,
    onDecode,
}) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ background: "linear-gradient(45deg, #3B82F6, #60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Decode DIGIPIN
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Enter a DIGIPIN code to find its precise location coordinates.
                </Typography>
            </Box>

            <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Stack spacing={2}>
                    <TextField
                        label="Enter DIGIPIN"
                        placeholder="e.g., 88-88-88"
                        value={decodeDigipin}
                        onChange={(e) => setDecodeDigipin(e.target.value)}
                        fullWidth
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 3 } }}
                    />
                    <Button
                        variant="contained"
                        onClick={onDecode}
                        fullWidth
                        size="large"
                        sx={{ borderRadius: 3, py: 1.5, fontSize: "1.1rem", textTransform: "none" }}
                    >
                        Decode Coordinates
                    </Button>
                </Stack>
            </Paper>

            {decodeResult && (
                <Fade in timeout={500}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                        }}
                    >
                        <Stack spacing={2}>
                            <Typography variant="subtitle2" color="secondary" fontWeight="bold" sx={{ letterSpacing: 1, textAlign: "center" }}>
                                COORDINATES FOUND
                            </Typography>

                            <Stack direction="row" spacing={2} justifyContent="center">
                                <Chip
                                    label={`Lat: ${decodeResult.lat}`}
                                    variant="outlined"
                                    color="secondary"
                                    sx={{ fontWeight: "bold", borderRadius: 2, border: "1px solid rgba(16, 185, 129, 0.5)" }}
                                />
                                <Chip
                                    label={`Lng: ${decodeResult.lng}`}
                                    variant="outlined"
                                    color="secondary"
                                    sx={{ fontWeight: "bold", borderRadius: 2, border: "1px solid rgba(16, 185, 129, 0.5)" }}
                                />
                            </Stack>

                            <Divider flexItem sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

                            <Stack direction="row" spacing={2} justifyContent="center">
                                <Button
                                    variant="text"
                                    color="secondary"
                                    startIcon={<LocationOn />}
                                    href={`https://www.google.com/maps?q=${decodeResult.lat},${decodeResult.lng}`}
                                    target="_blank"
                                >
                                    Open in Maps
                                </Button>
                                <Tooltip title={copied ? "Copied!" : "Copy Link"}>
                                    <IconButton
                                        onClick={() => handleCopy(`https://www.google.com/maps?q=${decodeResult.lat},${decodeResult.lng}`)}
                                        color="secondary"
                                        sx={{ bgcolor: "rgba(16, 185, 129, 0.1)", "&:hover": { bgcolor: "rgba(16, 185, 129, 0.2)" } }}
                                    >
                                        {copied ? <CheckCircle /> : <LinkIcon />}
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    </Paper>
                </Fade>
            )}

            {decodeError && (
                <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                    {decodeError}
                </Alert>
            )}
        </Stack>
    );
};
