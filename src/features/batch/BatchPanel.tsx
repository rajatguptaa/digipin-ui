import React from "react";
import { Box, Typography, TextField, Button, Alert, Paper, Stack, Fade, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Code, DataObject } from "@mui/icons-material";

interface BatchPanelProps {
    batchInput: string;
    setBatchInput: (val: string) => void;
    batchResult: any[];
    batchError: string;
    onBatchEncode: () => void;
    onBatchDecode: () => void;
}

export const BatchPanel: React.FC<BatchPanelProps> = ({
    batchInput,
    setBatchInput,
    batchResult,
    batchError,
    onBatchEncode,
    onBatchDecode,
}) => {
    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ background: "linear-gradient(45deg, #3B82F6, #60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Batch Processing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Process multiple coordinates or DIGIPINs at once.
                </Typography>
            </Box>

            <Paper sx={{ p: 3, borderRadius: 4 }}>
                <Stack spacing={2}>
                    <TextField
                        label="Input Data"
                        placeholder={"28.6139,77.2090\n19.0760,72.8777\nor\n39J-438-TJC7\n4FK-595-8823"}
                        value={batchInput}
                        onChange={(e) => setBatchInput(e.target.value)}
                        multiline
                        minRows={6}
                        fullWidth
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: 3, fontFamily: "monospace" } }}
                        helperText="Enter one item per line"
                    />
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            onClick={onBatchEncode}
                            startIcon={<Code />}
                            fullWidth
                            sx={{ borderRadius: 3, py: 1.5 }}
                        >
                            Batch Encode
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={onBatchDecode}
                            startIcon={<DataObject />}
                            fullWidth
                            sx={{ borderRadius: 3, py: 1.5 }}
                        >
                            Batch Decode
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            {batchError && (
                <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                    {batchError}
                </Alert>
            )}

            {batchResult.length > 0 && (
                <Fade in timeout={500}>
                    <Paper sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Results ({batchResult.length})
                            </Typography>
                        </Box>
                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: "#1a1a1a" }}>Input</TableCell>
                                        <TableCell sx={{ bgcolor: "#1a1a1a" }}>Result</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {batchResult.map((row, i) => (
                                        <TableRow key={i} hover>
                                            <TableCell sx={{ fontFamily: "monospace", color: "text.secondary" }}>{row.input}</TableCell>
                                            <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold", color: "primary.main" }}>
                                                {typeof row.result === "string" ? row.result : JSON.stringify(row.result)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Fade>
            )}
        </Stack>
    );
};
