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
    const theme = darkTheme; // Use the defined theme
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#000" }}>
                <AppBar position="static" elevation={0}>
                    <Toolbar sx={{ height: 80, px: { xs: 2, sm: 4 } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
                            <AppLogo />
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                <Typography
                                    variant="h5"
                                    component="div"
                                    sx={{
                                        fontWeight: 700,
                                        background: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        letterSpacing: "-0.02em",
                                        display: { xs: "none", sm: "block" }
                                    }}
                                >
                                    DIGIPIN
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "text.secondary",
                                        fontWeight: 500,
                                        letterSpacing: "0.05em",
                                        textTransform: "uppercase",
                                        fontSize: "0.7rem",
                                        display: { xs: "none", md: "block" }
                                    }}
                                >
                                    India's Smart Location System
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Tooltip title="About DIGIPIN">
                                <IconButton
                                    onClick={onInfoClick}
                                    sx={{
                                        color: "text.secondary",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            color: "primary.main",
                                            background: "rgba(59, 130, 246, 0.15)",
                                            transform: "scale(1.1)"
                                        }
                                    }}
                                >
                                    <Info />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box sx={{ flexGrow: 1, overflow: "hidden", position: "relative", pb: isMobile ? "70px" : 0 }}>{children}</Box>
                {isMobile && currentTab !== undefined && onTabChange && (
                    <MobileNav value={currentTab} onChange={onTabChange} />
                )}
            </Box>
        </ThemeProvider>
    );
};
