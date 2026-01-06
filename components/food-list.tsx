"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/date-utils";
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

interface FoodListProps {
  entries: FoodEntry[];
  onDelete?: () => void;
}

export function FoodList({ entries, onDelete }: FoodListProps) {
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/food?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Food entry deleted");
      onDelete?.();
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  if (entries.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🍽️</span>
          </div>
          <p className="text-gray-500">No food logged yet today</p>
          <p className="text-sm text-gray-400 mt-1">
            Tap the + button to add your first meal
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Today&apos;s Food
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{entry.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">
                  {formatTime(entry.loggedAt)}
                </span>
                {entry.protein && (
                  <span className="text-xs text-gray-400">
                    P: {entry.protein}g
                  </span>
                )}
                {entry.carbs && (
                  <span className="text-xs text-gray-400">
                    C: {entry.carbs}g
                  </span>
                )}
                {entry.fat && (
                  <span className="text-xs text-gray-400">
                    F: {entry.fat}g
                  </span>
                )}
              </div>
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
}

