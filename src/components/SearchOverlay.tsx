import React from 'react';
import { Paper, Box, Autocomplete, TextField, CircularProgress, Typography } from '@mui/material';
import { Search, LocationOn } from '@mui/icons-material';

export type SearchResult = { place_id: number; display_name: string; lat: string; lon: string };

export default function SearchOverlay({
  searchResults,
  searchQuery,
  setSearchQuery,
  searching,
  onSelect,
}: {
  searchResults: SearchResult[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searching: boolean;
  onSelect: (r: SearchResult) => void;
}) {
  return (
    <Paper elevation={4} sx={{ position: 'absolute', top: 20, left: 20, width: 350, zIndex: 2000, borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <Box sx={{ p: 2 }}>
        <Autocomplete
          freeSolo
          options={searchResults}
          disablePortal={false}
          slotProps={{ popper: { sx: { zIndex: 2000 } } }}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.display_name)}
          inputValue={searchQuery}
          onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)}
          onChange={(event, newValue) => {
            if (newValue && typeof newValue !== 'string') {
              onSelect(newValue as SearchResult);
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
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
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
              <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" noWrap>
                {option.display_name}
              </Typography>
            </Box>
          )}
          noOptionsText="No places found"
          sx={{ width: '100%' }}
        />
      </Box>
    </Paper>
  );
}

