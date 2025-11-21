export interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export interface FavoriteItem {
  id: number;
  label: string;
  lat: number;
  lng: number;
  pin: string;
}
