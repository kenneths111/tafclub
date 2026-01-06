"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface SearchResult {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize?: string;
}

interface FoodSearchProps {
  onAdd?: () => void;
}

export function FoodSearch({ onAdd }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingFood, setAddingFood] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchFoods = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        searchFoods(query);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchFoods]);

  const handleAddFood = async (food: SearchResult) => {
    setAddingFood(food.name);
    try {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add food");
      }

      toast.success(`Added ${food.name}!`);
      setQuery("");
      setResults([]);
      setHasSearched(false);
      onAdd?.();
    } catch {
      toast.error("Failed to add food");
    } finally {
      setAddingFood(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for food (e.g., banana, chicken breast...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 pl-10 text-lg"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {hasSearched && !isSearching && results.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="py-6 text-center text-gray-500">
            No results found. Try a different search term or add manually.
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="border-0 shadow-lg max-h-80 overflow-y-auto">
          <CardContent className="p-2">
            {results.map((food, index) => (
              <div
                key={`${food.name}-${index}`}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                onClick={() => handleAddFood(food)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{food.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{food.servingSize}</span>
                    {food.protein && <span>P: {food.protein}g</span>}
                    {food.carbs && <span>C: {food.carbs}g</span>}
                    {food.fat && <span>F: {food.fat}g</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-600 whitespace-nowrap">
                    {food.calories} cal
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={addingFood === food.name}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    {addingFood === food.name ? "..." : "+"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

