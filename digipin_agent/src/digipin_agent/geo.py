"""Core DIGIPIN math utilities mirrored from digipinjs."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Iterable, List, Tuple


DIGIPIN_GRID: Tuple[Tuple[str, ...], ...] = (
    ("F", "C", "9", "8"),
    ("J", "3", "2", "7"),
    ("K", "4", "5", "6"),
    ("L", "M", "P", "T"),
)

DIGIPIN_BOUNDS = {
    "min_lat": 2.5,
    "max_lat": 38.5,
    "min_lon": 63.5,
    "max_lon": 99.5,
}


class DigiPinValidationError(ValueError):
    """Raised when a DIGIPIN fails validation."""


def _normalise_pin(pin: str) -> str:
    if not isinstance(pin, str):
        raise DigiPinValidationError("DIGIPIN must be a string")
    clean = pin.strip().upper().replace("-", "")
    if len(clean) != 10:
        raise DigiPinValidationError("DIGIPIN must have 10 characters")
    for char in clean:
        if char not in {cell for row in DIGIPIN_GRID for cell in row}:
            raise DigiPinValidationError(f"Invalid DIGIPIN character: {char}")
    return clean


def is_valid_digipin(pin: str) -> bool:
    try:
        _normalise_pin(pin)
        return True
    except DigiPinValidationError:
        return False


def encode_coordinates(lat: float, lon: float) -> str:
    """Encode latitude & longitude into a DIGIPIN code."""
    if not (DIGIPIN_BOUNDS["min_lat"] <= lat <= DIGIPIN_BOUNDS["max_lat"]):
        raise DigiPinValidationError("Latitude out of range for DIGIPIN grid")
    if not (DIGIPIN_BOUNDS["min_lon"] <= lon <= DIGIPIN_BOUNDS["max_lon"]):
        raise DigiPinValidationError("Longitude out of range for DIGIPIN grid")

    min_lat, max_lat = DIGIPIN_BOUNDS["min_lat"], DIGIPIN_BOUNDS["max_lat"]
    min_lon, max_lon = DIGIPIN_BOUNDS["min_lon"], DIGIPIN_BOUNDS["max_lon"]

    code_chars: List[str] = []
    for level in range(1, 11):
        lat_step = (max_lat - min_lat) / 4.0
        lon_step = (max_lon - min_lon) / 4.0

        row = 3 - int(math.floor((lat - min_lat) / lat_step))
        col = int(math.floor((lon - min_lon) / lon_step))

        row = max(0, min(3, row))
        col = max(0, min(3, col))
        code_chars.append(DIGIPIN_GRID[row][col])

        if level == 3 or level == 6:
            code_chars.append("-")

        max_lat = min_lat + lat_step * (4 - row)
        min_lat = min_lat + lat_step * (3 - row)
        min_lon = min_lon + lon_step * col
        max_lon = min_lon + lon_step

    code = "".join(code_chars)
    # Remove trailing dash if loop appended (won't happen with current logic but safe)
    return code.rstrip("-")


@dataclass
class DecodedDigipin:
    latitude: float
    longitude: float
    bounds: Tuple[Tuple[float, float], Tuple[float, float]]

    def model_dump(self) -> dict:
        return {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "bounds": {
                "south_west": {"lat": self.bounds[0][0], "lon": self.bounds[0][1]},
                "north_east": {"lat": self.bounds[1][0], "lon": self.bounds[1][1]},
            },
        }


def decode_digipin(pin: str) -> DecodedDigipin:
    """Decode a DIGIPIN string into centre coordinates and bounding box."""
    clean = _normalise_pin(pin)

    min_lat, max_lat = DIGIPIN_BOUNDS["min_lat"], DIGIPIN_BOUNDS["max_lat"]
    min_lon, max_lon = DIGIPIN_BOUNDS["min_lon"], DIGIPIN_BOUNDS["max_lon"]

    grid_lookup = {cell: (r, c) for r, row in enumerate(DIGIPIN_GRID) for c, cell in enumerate(row)}

    for char in clean:
        row, col = grid_lookup[char]
        lat_step = (max_lat - min_lat) / 4.0
        lon_step = (max_lon - min_lon) / 4.0

        new_max_lat = min_lat + lat_step * (4 - row)
        new_min_lat = min_lat + lat_step * (3 - row)
        new_min_lon = min_lon + lon_step * col
        new_max_lon = new_min_lon + lon_step

        min_lat, max_lat = new_min_lat, new_max_lat
        min_lon, max_lon = new_min_lon, new_max_lon

    latitude = (min_lat + max_lat) / 2.0
    longitude = (min_lon + max_lon) / 2.0
    return DecodedDigipin(
        latitude=latitude,
        longitude=longitude,
        bounds=((min_lat, min_lon), (max_lat, max_lon)),
    )


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_earth = 6371000.0  # metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return radius_earth * c


def get_distance_meters(pin_a: str, pin_b: str) -> float:
    start = decode_digipin(pin_a)
    end = decode_digipin(pin_b)
    return _haversine(start.latitude, start.longitude, end.latitude, end.longitude)


def get_distance_summary(pin_a: str, pin_b: str) -> dict:
    meters = get_distance_meters(pin_a, pin_b)
    return {
        "meters": meters,
        "kilometers": meters / 1000.0,
        "formatted": f"{meters/1000.0:.2f} km",
    }


def nearest_pin(reference_pin: str, pins: Iterable[str]) -> str:
    pins_list = list(pins)
    if not pins_list:
        raise DigiPinValidationError("No DIGIPIN values supplied")
    reference = decode_digipin(reference_pin)

    def distance_to(pin: str) -> float:
        decoded = decode_digipin(pin)
        return _haversine(reference.latitude, reference.longitude, decoded.latitude, decoded.longitude)

    nearest = min(pins_list, key=distance_to)
    return nearest
