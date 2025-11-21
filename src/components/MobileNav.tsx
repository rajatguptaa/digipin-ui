import React from "react";
import { Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { LocationOn, Code, Storage, Assistant } from "@mui/icons-material";

interface MobileNavProps {
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ value, onChange }) => {
    return (
        <Paper
            sx={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                borderRadius: "16px 16px 0 0",
                overflow: "hidden",
                boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
                borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={value}
                onChange={onChange}
                sx={{
                    bgcolor: "rgba(20,20,20,0.95)",
                    backdropFilter: "blur(10px)",
                    height: 70,
                    "& .MuiBottomNavigationAction-root": {
                        color: "text.secondary",
                        "&.Mui-selected": {
                            color: "primary.main",
                        },
                    },
                }}
            >
                <BottomNavigationAction label="Map" icon={<LocationOn />} />
                <BottomNavigationAction label="Encode" icon={<Code />} />
                <BottomNavigationAction label="Decode" icon={<Code sx={{ transform: "rotate(90deg)" }} />} />
                <BottomNavigationAction label="Tools" icon={<Storage />} />
                <BottomNavigationAction label="AI" icon={<Assistant />} />
            </BottomNavigation>
        </Paper>
    );
};
