"use client";

import { Neighborhood } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ResultsDisplayProps {
  neighborhoods: Neighborhood[];
  city: string;
  state: string;
}

export function ResultsDisplay({
  neighborhoods,
  city,
  state,
}: ResultsDisplayProps) {
  const handleExport = () => {
    const csv = [
      ["Neighborhood Name", "Type", "Latitude", "Longitude"].join(","),
      ...neighborhoods.map((n) =>
        [n.name, n.type, n.coordinates[0], n.coordinates[1]].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${city}-${state}-neighborhoods-page${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Neighborhoods in {city}, {state}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {neighborhoods.length} neighborhoods. Click search again to
            see more results.
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Current Page
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {neighborhoods.map((neighborhood) => (
          <div
            key={`${
              neighborhood.name
            }-${neighborhood.coordinates.join()}-${Math.random()}`}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">{neighborhood.name}</h3>
            <p className="text-sm text-muted-foreground">
              {neighborhood.coordinates[0].toFixed(4)},{" "}
              {neighborhood.coordinates[1].toFixed(4)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
