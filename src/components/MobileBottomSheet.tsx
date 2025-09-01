import React from 'react';
import { Box, Paper, Tabs, Tab, Typography, TextField, Button, Alert, CircularProgress, Chip, IconButton, Tooltip } from '@mui/material';
import { LocationOn, ContentCopy, CheckCircle, Link as LinkIcon } from '@mui/icons-material';

type Props = {
  open: boolean;
  onClose: () => void;
  activeTab: number;
  onTabChange: (t: number) => void;
  // Encode
  encodeLat: string;
  encodeLng: string;
  setEncodeLat: (v: string) => void;
  setEncodeLng: (v: string) => void;
  encodeCoordinates: () => void;
  encodeResult: string;
  encodeError: string;
  locationName: string;
  loadingLocation: boolean;
  selectedLocation: { lat: number; lng: number } | null;
  copyToClipboard: (s: string) => void;
  // Decode
  decodeDigipin: string;
  setDecodeDigipin: (v: string) => void;
  decodeDigipinCode: () => void;
  decodeResult: { lat: number; lng: number } | null;
  decodeError: string;
};

export default function MobileBottomSheet(props: Props) {
  const {
    open,
    onClose,
    activeTab,
    onTabChange,
    encodeLat,
    encodeLng,
    setEncodeLat,
    setEncodeLng,
    encodeCoordinates,
    encodeResult,
    encodeError,
    locationName,
    loadingLocation,
    selectedLocation,
    copyToClipboard,
    decodeDigipin,
    setDecodeDigipin,
    decodeDigipinCode,
    decodeResult,
    decodeError,
  } = props;

  return (
    <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 1600, pointerEvents: 'none' }}>
      <Paper
        elevation={6}
        sx={{
          mx: 'auto',
          width: '100%',
          maxWidth: '100vw',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'background.paper',
          boxShadow: 3,
          height: open ? '60vh' : 0,
          overflow: 'hidden',
          transition: 'height 220ms ease',
          pointerEvents: 'auto',
        }}
      >
        <Box sx={{ width: 40, height: 4, bgcolor: 'grey.600', borderRadius: 2, mx: 'auto', my: 1 }} onClick={onClose} />
        <Tabs value={activeTab} onChange={(_, v) => onTabChange(v)} variant="fullWidth" sx={{ backgroundColor: 'rgba(100, 181, 246, 0.1)' }}>
          <Tab icon={<LocationOn />} label="Encode" iconPosition="start" sx={{ color: '#64b5f6' }} />
          <Tab icon={<LocationOn />} label="Decode" iconPosition="start" sx={{ color: '#64b5f6' }} />
        </Tabs>
        {activeTab === 0 && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {locationName && (
              <Alert severity="info" icon={<LocationOn />} sx={{ backgroundColor: 'rgba(100,181,246,0.1)' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Location:
                </Typography>
                <Typography variant="body2">{locationName}</Typography>
              </Alert>
            )}
            {loadingLocation && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                <CircularProgress size={16} sx={{ color: '#64b5f6' }} />
                <Typography variant="body2" color="text.secondary">
                  Getting location name...
                </Typography>
              </Box>
            )}
            <TextField label="Latitude" value={encodeLat} onChange={(e) => setEncodeLat(e.target.value)} fullWidth size="small" />
            <TextField label="Longitude" value={encodeLng} onChange={(e) => setEncodeLng(e.target.value)} fullWidth size="small" />
            <Button variant="contained" onClick={encodeCoordinates} fullWidth sx={{ backgroundColor: '#64b5f6' }}>
              Generate DIGIPIN
            </Button>
            {encodeResult && (
              <Alert severity="success" sx={{ backgroundColor: 'rgba(129,199,132,0.1)' }}>
                <Typography variant="subtitle2" gutterBottom>
                  DIGIPIN Generated:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip label={encodeResult} color="primary" variant="filled" sx={{ fontSize: '1.05rem', fontWeight: 'bold', backgroundColor: '#64b5f6' }} />
                  <IconButton size="small" onClick={() => copyToClipboard(encodeResult)} sx={{ color: '#64b5f6' }}>
                    <ContentCopy />
                  </IconButton>
                </Box>
                {selectedLocation && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      href={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ borderColor: '#64b5f6', color: '#64b5f6' }}
                      startIcon={<LocationOn />}
                    >
                      Open in Google Maps
                    </Button>
                    <Tooltip title="Copy Google Maps link">
                      <IconButton size="small" onClick={() => navigator.clipboard.writeText(`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`)} sx={{ color: '#64b5f6' }}>
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Alert>
            )}
            {encodeError && <Alert severity="error">{encodeError}</Alert>}
          </Box>
        )}
        {activeTab === 1 && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ color: '#ffffff' }}>
              Convert DIGIPIN to Coordinates
            </Typography>
            <TextField label="DIGIPIN" value={decodeDigipin} onChange={(e) => setDecodeDigipin(e.target.value)} fullWidth size="small" />
            <Button variant="contained" onClick={decodeDigipinCode} fullWidth sx={{ backgroundColor: '#64b5f6' }}>
              Decode Coordinates
            </Button>
            {decodeResult && (
              <Alert severity="success" sx={{ backgroundColor: 'rgba(129,199,132,0.1)' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Coordinates Found:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  <Chip label={`Latitude: ${decodeResult.lat}`} color="primary" variant="outlined" icon={<LocationOn />} sx={{ borderColor: '#64b5f6', color: '#64b5f6' }} />
                  <Chip label={`Longitude: ${decodeResult.lng}`} color="primary" variant="outlined" icon={<LocationOn />} sx={{ borderColor: '#64b5f6', color: '#64b5f6' }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    href={`https://www.google.com/maps?q=${decodeResult.lat},${decodeResult.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ borderColor: '#64b5f6', color: '#64b5f6' }}
                    startIcon={<LocationOn />}
                  >
                    Open in Google Maps
                  </Button>
                  <Tooltip title="Copy Google Maps link">
                    <IconButton size="small" onClick={() => navigator.clipboard.writeText(`https://www.google.com/maps?q=${decodeResult.lat},${decodeResult.lng}`)} sx={{ color: '#64b5f6' }}>
                      <LinkIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Alert>
            )}
            {decodeError && <Alert severity="error">{decodeError}</Alert>}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

