import React, { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        mappls: any;
        mappls_plugin?: any;
    }
}

interface MapplsMapViewProps {
    apiKey?: string;
    center: { lat: number; lng: number };
    zoom: number;
    onMapLoad?: (map: any) => void;
    onClick?: (coords: { lat: number; lng: number }) => void;
    children?: React.ReactNode;
}

export const MapplsMapView: React.FC<MapplsMapViewProps> = ({
    apiKey = process.env.REACT_APP_MAPMYINDIA_KEY,
    center,
    zoom,
    onMapLoad,
    onClick,
    children,
}) => {
    const mapContainerId = useRef(`mappls-map-${Math.random().toString(36).substr(2, 9)}`);
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const initAttempted = useRef(false);

    // Load the Mappls SDK script
    useEffect(() => {
        if (!apiKey) return;

        const loadScript = () => {
            if (window.mappls) {
                setScriptLoaded(true);
                return;
            }

            const script = document.createElement("script");
            script.src = `https://apis.mappls.com/advancedmaps/api/${apiKey}/map_sdk?layer=vector&v=3.0`;
            script.async = false; // Load synchronously
            script.onload = () => {
                console.log("Mappls SDK loaded successfully");
                setScriptLoaded(true);
            };
            script.onerror = () => {
                console.error("Failed to load Mappls SDK");
            };
            document.head.appendChild(script);
        };

        loadScript();
    }, [apiKey]);

    // Initialize the map once SDK is loaded
    useEffect(() => {
        if (!scriptLoaded || !window.mappls || initAttempted.current || mapInstance) {
            return;
        }

        initAttempted.current = true;

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            try {
                console.log("Initializing Mappls map with ID:", mapContainerId.current);

                const map = new window.mappls.Map(mapContainerId.current, {
                    center: [center.lat, center.lng],
                    zoom: zoom,
                });

                console.log("Map instance created:", map);
                setMapInstance(map);

                // Add click listener
                if (onClick && map && typeof map.addListener === 'function') {
                    map.addListener("click", (e: any) => {
                        if (e.lngLat) {
                            onClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
                        }
                    });
                }

                // Call onMapLoad callback
                if (onMapLoad) {
                    setTimeout(() => onMapLoad(map), 200);
                }
            } catch (error) {
                console.error("Error initializing Mappls map:", error);
                initAttempted.current = false; // Allow retry
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [scriptLoaded, center.lat, center.lng, zoom, onClick, onMapLoad, mapInstance]);

    // Update center/zoom when they change
    useEffect(() => {
        if (!mapInstance) return;

        try {
            if (typeof mapInstance.setCenter === 'function') {
                mapInstance.setCenter({ lat: center.lat, lng: center.lng });
            }
            if (typeof mapInstance.setZoom === 'function') {
                mapInstance.setZoom(zoom);
            }
        } catch (error) {
            console.error("Error updating map view:", error);
        }
    }, [center.lat, center.lng, zoom, mapInstance]);

    if (!apiKey) {
        return (
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#000",
                    color: "#fff",
                }}
            >
                <div>
                    <h3>MapmyIndia API Key Missing</h3>
                    <p>Please set REACT_APP_MAPMYINDIA_KEY in your .env file.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            id={mapContainerId.current}
            style={{ width: "100%", height: "100%", position: "relative" }}
        />
    );
};
