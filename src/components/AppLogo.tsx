import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface AppLogoProps {
  sx?: SxProps<Theme>;
}

/**
 * Displays the Digipin Explorer wordmark with the pin icon.
 * Uses inline SVG to avoid additional assets while keeping semantic heading text.
 */
export function AppLogo({ sx }: AppLogoProps) {
  return (
    <Typography
      variant="h6"
      component="h1"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        color: "#64b5f6",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 1,
        ...sx,
      }}
    >
      <Box
        component="span"
        sx={{ width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        aria-hidden
      >
        <svg width="32" height="32" viewBox="0 0 64 64" role="presentation">
          <defs>
            <linearGradient id="digipin-logo-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#64b5f6" />
              <stop offset="1" stopColor="#2286c3" />
            </linearGradient>
            <filter id="digipin-drop-shadow" x="-20%" y="-10%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
            </filter>
          </defs>
          <rect width="64" height="64" rx="16" fill="#0a0a0a" />
          <path
            d="M32 10c9.94 0 18 8.06 18 18 0 12.94-18 34-18 34S14 40.94 14 28c0-9.94 8.06-18 18-18z"
            fill="url(#digipin-logo-gradient)"
            filter="url(#digipin-drop-shadow)"
          />
          <circle cx="32" cy="28" r="7" fill="#ffffff" />
        </svg>
      </Box>
      {/* <Box component="span" sx={{ fontSize: "0.95em" }}>
        Digipin Explorer
      </Box> */}
    </Typography>
  );
}
