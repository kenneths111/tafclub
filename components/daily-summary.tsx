"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DailySummaryProps {
  totalCalories: number;
  goalCalories?: number | null;
  streak: number;
}

export function DailySummary({ totalCalories, goalCalories, streak }: DailySummaryProps) {
  const goal = goalCalories || 2000;
  const percentage = Math.min((totalCalories / goal) * 100, 100);
  const remaining = Math.max(goal - totalCalories, 0);
  const isOver = totalCalories > goal;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Calories Today */}
      <Card className="md:col-span-2 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Today&apos;s Calories</h3>
            <span className="text-xs text-gray-400">Goal: {goal} cal</span>
          </div>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {totalCalories}
            </span>
            <span className="text-gray-400 mb-2">cal</span>
          </div>
          <Progress 
            value={percentage} 
            className="h-3 bg-gray-100"
          />
          <p className="mt-3 text-sm">
            {isOver ? (
              <span className="text-amber-600">
                {totalCalories - goal} cal over your goal
              </span>
            ) : (
              <span className="text-gray-600">
                {remaining} cal remaining
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🔥</span>
          </div>
          <p className="text-4xl font-bold text-amber-600">{streak}</p>
          <p className="text-sm text-gray-600 mt-1">Day Streak</p>
          <p className="text-xs text-gray-400 mt-2">
            {streak === 0
              ? "Log food to start your streak!"
              : streak === 1
              ? "Great start! Keep it going!"
              : `${streak} days in a row!`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

