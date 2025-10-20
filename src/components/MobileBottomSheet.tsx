import React from "react";
import { Box, Paper, Tabs, Tab } from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  primaryTab: number;
  onPrimaryTabChange: (value: number) => void;
  encodeSubTab: number;
  onEncodeSubTabChange: (value: number) => void;
  encodeSingleContent: React.ReactNode;
  encodeBatchContent: React.ReactNode;
  encodeGeoContent: React.ReactNode;
  decodeContent: React.ReactNode;
  assistantContent: React.ReactNode;
};

export default function MobileBottomSheet({
  open,
  onClose,
  primaryTab,
  onPrimaryTabChange,
  encodeSubTab,
  onEncodeSubTabChange,
  encodeSingleContent,
  encodeBatchContent,
  encodeGeoContent,
  decodeContent,
  assistantContent,
}: Props) {
  const encodeViews = [encodeSingleContent, encodeBatchContent, encodeGeoContent];

  return (
    <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 1600, pointerEvents: "none" }}>
      <Paper
        elevation={6}
        sx={{
          mx: "auto",
          width: "100%",
          maxWidth: "100vw",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          backgroundColor: "background.paper",
          boxShadow: 3,
          height: open ? "60vh" : 0,
          overflow: "hidden",
          transition: "height 220ms ease",
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ width: 40, height: 4, bgcolor: "grey.600", borderRadius: 2, mx: "auto", my: 1 }} onClick={onClose} />

        <Tabs
          value={primaryTab}
          onChange={(_, value) => onPrimaryTabChange(value)}
          variant="fullWidth"
          sx={{ backgroundColor: "rgba(100, 181, 246, 0.1)" }}
        >
          <Tab value={0} label="Encode" sx={{ color: "#64b5f6" }} />
          <Tab value={1} label="Decode" sx={{ color: "#64b5f6" }} />
          <Tab value={2} label="AI Assistant" sx={{ color: "#64b5f6" }} />
        </Tabs>

        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 1.5, sm: 2 } }}>
          {primaryTab === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
              <Tabs
                value={encodeSubTab}
                onChange={(_, value) => onEncodeSubTabChange(value)}
                variant="fullWidth"
                sx={{ backgroundColor: "rgba(100, 181, 246, 0.08)" }}
              >
                <Tab value={0} label="Single Encode" sx={{ color: "#64b5f6" }} />
                <Tab value={1} label="Batch Tools" sx={{ color: "#64b5f6" }} />
                <Tab value={2} label="Geo Utilities" sx={{ color: "#64b5f6" }} />
              </Tabs>
              <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>{encodeViews[encodeSubTab]}</Box>
            </Box>
          )}

          {primaryTab === 1 && <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>{decodeContent}</Box>}

          {primaryTab === 2 && <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>{assistantContent}</Box>}
        </Box>
      </Paper>
    </Box>
  );
}
