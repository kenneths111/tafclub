"use client";

import { useEffect, useState, useCallback } from "react";
import { startOfDay, endOfDay } from "date-fns";
import { DailySummary } from "@/components/daily-summary";
import { FoodList } from "@/components/food-list";
import { FoodEntryForm } from "@/components/food-entry-form";
import { RecentFoods } from "@/components/recent-foods";
import { calculateStreak } from "@/lib/date-utils";

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  loggedAt: string;
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTodaysEntries = useCallback(async () => {
    try {
      const today = new Date();
      const startDate = startOfDay(today).toISOString();
      const endDate = endOfDay(today).toISOString();

      const res = await fetch(
        `/api/food?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  }, []);

  const fetchStreak = useCallback(async () => {
    try {
      // Fetch all entries to calculate streak
      const res = await fetch("/api/food");
      const data = await res.json();
      const allEntries = data.entries || [];
      
      // Get unique dates with entries
      const dates = allEntries.map((e: FoodEntry) => new Date(e.loggedAt));
      setStreak(calculateStreak(dates));
    } catch (error) {
      console.error("Error calculating streak:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchTodaysEntries(), fetchStreak()]);
    setIsLoading(false);
  }, [fetchTodaysEntries, fetchStreak]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Today</h1>
          <p className="text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <DailySummary
        totalCalories={totalCalories}
        goalCalories={null}
        streak={streak}
      />

      <RecentFoods onAdd={fetchData} />

      <FoodList entries={entries} onDelete={fetchData} />

      <FoodEntryForm onSuccess={fetchData} />
    </div>
  );
}

