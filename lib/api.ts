import { Neighborhood } from './types';
import { shuffleArray, paginateResults } from './utils';

let cachedNeighborhoods: { [key: string]: Neighborhood[] } = {};
let currentPage: { [key: string]: number } = {};

export async function searchNeighborhoods(city: string, state: string): Promise<Neighborhood[]> {
  const cacheKey = `${city.toLowerCase()}-${state.toLowerCase()}`;
  
  // Reset page to 1 if it's a new search
  if (!cachedNeighborhoods[cacheKey]) {
    currentPage[cacheKey] = 1;
  } else {
    currentPage[cacheKey] = (currentPage[cacheKey] || 0) + 1;
  }

  // Fetch new data if not cached
  if (!cachedNeighborhoods[cacheKey]) {
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

    const neighborhoods = response.elements
      .map((element: any) => ({
        name: element.tags.name,
        type: element.type,
        coordinates: element.center ? [element.center.lat, element.center.lon] : [element.lat, element.lon],
      }))
      .filter((n: Neighborhood) => n.name);

    cachedNeighborhoods[cacheKey] = neighborhoods;
  }

  // Get paginated and shuffled results
  const pageSize = 6;
  const maxPages = Math.ceil(cachedNeighborhoods[cacheKey].length / pageSize);
  
  // Reset to page 1 if we've reached the end
  if (currentPage[cacheKey] > maxPages) {
    currentPage[cacheKey] = 1;
  }

  const shuffledResults = shuffleArray(cachedNeighborhoods[cacheKey]);
  return paginateResults(shuffledResults, currentPage[cacheKey], pageSize);
}