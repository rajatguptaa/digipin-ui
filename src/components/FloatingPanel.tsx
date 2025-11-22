import React from "react";
import { Paper, Box, Typography, useTheme, useMediaQuery, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

interface FloatingPanelProps {
    title?: string;
    children: React.ReactNode;
    onClose?: () => void;
    width?: number | string;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
    title,
    children,
    onClose,
    width = 400
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <Paper
            elevation={4}
            sx={{
                position: isMobile ? "fixed" : "absolute",
                top: isMobile ? "auto" : 20,
                bottom: isMobile ? 0 : 20,
                left: isMobile ? 0 : 20,
                right: isMobile ? 0 : "auto",
                width: isMobile ? "100%" : width,
                maxHeight: isMobile ? "85vh" : "calc(100vh - 40px)",
                zIndex: 1100,
                display: "flex",
                flexDirection: "column",
                background: "rgba(17, 17, 17, 0.85)",
                backdropFilter: "blur(20px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: isMobile ? "24px 24px 0 0" : "24px",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            }}
        >
            {/* Header */}
            {(title || onClose) && (
                <Box
                    sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        background: "rgba(255, 255, 255, 0.02)",
                    }}
                >
                    {title && (
                        <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: "-0.01em" }}>
                            {title}
                        </Typography>
                    )}
                    {onClose && (
                        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
                            <Close />
                        </IconButton>
                    )}
                </Box>
            )}

            {/* Content */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    p: 0,
                    "&::-webkit-scrollbar": {
                        width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                        background: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "3px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        background: "rgba(255, 255, 255, 0.2)",
                    },
                }}
            >
                {children}
            </Box>
        </Paper>
    );
};
