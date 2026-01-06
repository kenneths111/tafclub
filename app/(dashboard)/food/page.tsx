"use client";

import { useEffect, useState, useCallback } from "react";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FoodSearch } from "@/components/food-search";
import { FoodEntryForm } from "@/components/food-entry-form";
import { Button } from "@/components/ui/button";
import { formatTime, getFriendlyDateLabel } from "@/lib/date-utils";
import { toast } from "sonner";

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  loggedAt: string;
}

interface GroupedEntries {
  [date: string]: FoodEntry[];
}

export default function FoodPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      // Get last 7 days of entries
      const endDate = endOfDay(new Date()).toISOString();
      const startDate = startOfDay(subDays(new Date(), 7)).toISOString();

      const res = await fetch(
        `/api/food?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/food?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Entry deleted");
      fetchEntries();
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  // Group entries by date
  const groupedEntries: GroupedEntries = entries.reduce((acc, entry) => {
    const dateKey = format(new Date(entry.loggedAt), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {} as GroupedEntries);

  // Sort dates descending
  const sortedDates = Object.keys(groupedEntries).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Food Log</h1>
        <p className="text-gray-500">Search, add, and view your food history</p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="search">Search & Add</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>🔍</span>
                Search Food Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FoodSearch onAdd={fetchEntries} />
            </CardContent>
          </Card>

          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">
              Can&apos;t find what you&apos;re looking for?
            </p>
            <FoodEntryForm
              onSuccess={fetchEntries}
              trigger={
                <Button
                  variant="outline"
                  className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                >
                  + Add Manually
                </Button>
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {sortedDates.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-gray-500">No food history yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start logging your meals to see them here
                </p>
              </CardContent>
            </Card>
          ) : (
            sortedDates.map((dateKey) => {
              const dayEntries = groupedEntries[dateKey];
              const totalCalories = dayEntries.reduce(
                (sum, e) => sum + e.calories,
                0
              );

              return (
                <Card key={dateKey} className="border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {getFriendlyDateLabel(dateKey)}
                      </CardTitle>
                      <span className="text-sm font-medium text-emerald-600">
                        {totalCalories} cal total
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {entry.name}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTime(entry.loggedAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-emerald-600">
                            {entry.calories} cal
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <FoodEntryForm onSuccess={fetchEntries} />
    </div>
  );
}

