import React from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    ThemeProvider,
    createTheme,
    CssBaseline,
    IconButton,
    Tooltip,
    useMediaQuery,
} from "@mui/material";
import { Info } from "@mui/icons-material";
import { AppLogo } from "../components/AppLogo";
import { MobileNav } from "../components/MobileNav";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#3B82F6", // Vibrant Blue
            light: "#60A5FA",
            dark: "#2563EB",
        },
        secondary: {
            main: "#10B981", // Emerald Green
            light: "#34D399",
            dark: "#059669",
        },
        background: {
            default: "#000000", // True black for OLED feel
            paper: "#111111",
        },
        text: {
            primary: "#F3F4F6",
            secondary: "#9CA3AF",
        },
    },
    typography: {
        fontFamily: "'Outfit', sans-serif",
        h6: {
            fontWeight: 600,
            letterSpacing: "-0.025em",
        },
        button: {
            fontWeight: 600,
            textTransform: "none",
            letterSpacing: "0.025em",
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    backgroundColor: "rgba(17, 17, 17, 0.7)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    boxShadow: "none",
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.06)",
                        },
                        "&.Mui-focused": {
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                            boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                        },
                        "& fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.1)",
                        },
                        "&:hover fieldset": {
                            borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "#3B82F6",
                            borderWidth: 1,
                        },
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: "8px 16px",
                    boxShadow: "none",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    },
                    "&:active": {
                        transform: "translateY(0)",
                    },
                },
                containedPrimary: {
                    background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
                filledPrimary: {
                    background: "rgba(59, 130, 246, 0.2)",
                    color: "#60A5FA",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    transition: "all 0.2s",
                    minHeight: 48,
                    "&.Mui-selected": {
                        color: "#60A5FA",
                        textShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                    },
                },
            },
        },
    },
});

interface MainLayoutProps {
    children: React.ReactNode;
    onInfoClick: () => void;
    currentTab?: number;
    onTabChange?: (event: React.SyntheticEvent, newValue: number) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onInfoClick, currentTab, onTabChange }) => {
    const theme = darkTheme;
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box sx={{
                position: "relative",
                height: "100vh",
                width: "100vw",
                overflow: "hidden",
                background: "#000"
            }}>
                {/* Map Background Container (Children will be the map) */}
                <Box sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0
                }}>
                    {children}
                </Box>

                {/* Floating Header (Logo & Search Area) */}
                <Box sx={{
                    position: "absolute",
                    top: 20,
                    left: isMobile ? 20 : 440, // Offset for panel on desktop
                    right: 20,
                    zIndex: 1000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pointerEvents: "none", // Let clicks pass through to map where empty
                }}>
                    {/* Logo Area (Only visible if not covered by panel or on mobile) */}
                    <Box sx={{
                        pointerEvents: "auto",
                        display: isMobile ? "flex" : "none", // Hidden on desktop as it's in the panel
                        alignItems: "center",
                        gap: 1.5,
                        background: "rgba(17, 17, 17, 0.85)",
                        backdropFilter: "blur(20px)",
                        p: 1,
                        px: 2,
                        borderRadius: "16px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
                    }}>
                        <AppLogo />
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>DIGIPIN</Typography>
                    </Box>

                    {/* Right Side Actions */}
                    <Box sx={{ pointerEvents: "auto", display: "flex", gap: 1, ml: "auto" }}>
                        <Tooltip title="About DIGIPIN">
                            <IconButton
                                onClick={onInfoClick}
                                sx={{
                                    background: "rgba(17, 17, 17, 0.85)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    color: "text.secondary",
                                    "&:hover": {
                                        background: "rgba(255, 255, 255, 0.1)",
                                        color: "primary.main",
                                    }
                                }}
                            >
                                <Info />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Mobile Navigation */}
                {isMobile && currentTab !== undefined && onTabChange && (
                    <MobileNav value={currentTab} onChange={onTabChange} />
                )}
            </Box>
        </ThemeProvider>
    );
};
