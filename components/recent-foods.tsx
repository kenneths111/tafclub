"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RecentFood {
  name: string;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  count: number;
}

interface RecentFoodsProps {
  onAdd?: () => void;
}

export function RecentFoods({ onAdd }: RecentFoodsProps) {
  const [foods, setFoods] = useState<RecentFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingFood, setAddingFood] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentFoods();
  }, []);

  const fetchRecentFoods = async () => {
    try {
      const res = await fetch("/api/food/recent");
      const data = await res.json();
      setFoods(data.foods || []);
    } catch (error) {
      console.error("Error fetching recent foods:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = async (food: RecentFood) => {
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
      onAdd?.();
    } catch {
      toast.error("Failed to add food");
    } finally {
      setAddingFood(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-8 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (foods.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span>⚡</span>
          Quick Add
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {foods.map((food) => (
            <Button
              key={food.name}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(food)}
              disabled={addingFood === food.name}
              className="h-auto py-2 px-3 flex flex-col items-start gap-0.5 hover:bg-emerald-50 hover:border-emerald-300"
            >
              <span className="font-medium text-gray-800">{food.name}</span>
              <span className="text-xs text-gray-500">{food.calories} cal</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

