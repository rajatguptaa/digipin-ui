import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography } from '@mui/material';
import { Info } from '@mui/icons-material';

export default function InfoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: '#ffffff' }}>
        About DIGIPIN
        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: '#64b5f6' }}>
          <Info />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography paragraph sx={{ color: '#ffffff' }}>
          DIGIPIN (Digital Postal Index Number) is a geocoding system for India that converts latitude and longitude
          coordinates into a unique alphanumeric code.
        </Typography>
        <Typography paragraph sx={{ color: '#ffffff' }}>
          <strong>Features:</strong>
        </Typography>
        <ul style={{ color: '#b0b0b0' }}>
          <li>Search for places in India and navigate directly to them</li>
          <li>Click anywhere on the map of India to select coordinates</li>
          <li>Get location names automatically using reverse geocoding</li>
          <li>Use the current location button to get your exact position</li>
          <li>Convert coordinates to DIGIPIN and vice versa</li>
          <li>Copy results to clipboard with one click</li>
        </ul>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Powered by{' '}
          <a href="https://github.com/rajatguptaa/digipinjs" target="_blank" rel="noopener noreferrer" style={{ color: '#64b5f6' }}>
            digipinjs
          </a>{' '}
          and{' '}
          <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#64b5f6' }}>
            Nominatim
          </a>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#64b5f6' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
