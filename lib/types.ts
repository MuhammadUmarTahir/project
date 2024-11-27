export interface Neighborhood {
  name: string;
  type: string;
  coordinates: [number, number];
}

export interface SearchResult {
  city: string;
  state: string;
  neighborhoods: Neighborhood[];
  timestamp: string;
}