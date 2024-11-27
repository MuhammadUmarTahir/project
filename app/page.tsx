'use client';

import { useState } from 'react';
import { SearchForm } from '@/app/components/search-form';
import { ResultsDisplay } from '@/app/components/results-display';
import { searchNeighborhoods } from '@/lib/api';
import { Neighborhood } from '@/lib/types';
import { MapPin } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{
    neighborhoods: Neighborhood[];
    city: string;
    state: string;
  } | null>(null);

  const handleSearch = async (city: string, state: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const neighborhoods = await searchNeighborhoods(city, state);
      setSearchResults({ neighborhoods, city, state });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <MapPin className="h-8 w-8" />
          <h1 className="text-4xl font-bold">Neighborhood Finder</h1>
        </div>
        <p className="text-muted-foreground">
          Search for neighborhoods in any US city and export the results
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {searchResults && (
        <ResultsDisplay
          neighborhoods={searchResults.neighborhoods}
          city={searchResults.city}
          state={searchResults.state}
        />
      )}
    </main>
  );
}