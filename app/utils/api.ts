import { Neighborhood } from '../types';

export async function searchNeighborhoods(city: string, state: string): Promise<Neighborhood[]> {
  // First, get coordinates for the city
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
    city
  )}&state=${encodeURIComponent(state)}&country=USA&format=json`;

  const cityData = await fetch(nominatimUrl, {
    headers: {
      'User-Agent': 'NeighborhoodFinder/1.0',
    },
  }).then((res) => res.json());

  if (!cityData?.[0]) {
    throw new Error('City not found');
  }

  const { lat, lon } = cityData[0];

  // Use Overpass API to get neighborhoods
  const query = `
    [out:json][timeout:25];
    area[name="${city}"][admin_level~"[48]"]->.searchArea;
    (
      way["place"="neighbourhood"](area.searchArea);
      relation["place"="neighbourhood"](area.searchArea);
    );
    out center;
  `;

  const overpassUrl = `https://overpass-api.de/api/interpreter`;
  const response = await fetch(overpassUrl, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
  }).then((res) => res.json());

  return response.elements
    .map((element: any) => ({
      name: element.tags.name,
      type: element.type,
      coordinates: element.center ? [element.center.lat, element.center.lon] : [element.lat, element.lon],
    }))
    .filter((n: Neighborhood) => n.name);
}