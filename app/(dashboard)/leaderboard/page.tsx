"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  name: string;
  value: number;
  rank: number;
}

type LeaderboardType = "streak" | "weekly_calories" | "today_calories" | "weight_loss";

const leaderboardTypes: { value: LeaderboardType; label: string; icon: string; unit: string }[] = [
  { value: "streak", label: "Streak", icon: "🔥", unit: " days" },
  { value: "weekly_calories", label: "Weekly", icon: "📅", unit: " cal" },
  { value: "today_calories", label: "Today", icon: "🍽️", unit: " cal" },
  { value: "weight_loss", label: "Weight Lost", icon: "⚖️", unit: " kg" },
];

export default function LeaderboardPage() {
  const [activeType, setActiveType] = useState<LeaderboardType>("streak");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = useCallback(async (type: LeaderboardType) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?type=${type}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      setCurrentUserId(data.currentUserId || "");
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(activeType);
  }, [activeType, fetchLeaderboard]);

  const getTypeConfig = (type: LeaderboardType) => {
    return leaderboardTypes.find((t) => t.value === type) || leaderboardTypes[0];
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const config = getTypeConfig(activeType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Leaderboard</h1>
        <p className="text-gray-500">See how you stack up against your friends</p>
      </div>

      <Tabs value={activeType} onValueChange={(v) => setActiveType(v as LeaderboardType)}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
          {leaderboardTypes.map((type) => (
            <TabsTrigger key={type.value} value={type.value} className="text-xs sm:text-sm">
              <span className="mr-1">{type.icon}</span>
              <span className="hidden sm:inline">{type.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {leaderboardTypes.map((type) => (
          <TabsContent key={type.value} value={type.value}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span>{type.icon}</span>
                  {type.label} Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🏆</span>
                    </div>
                    <p className="text-gray-500">No data yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Start logging to appear on the leaderboard!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl transition-colors",
                          entry.id === currentUserId
                            ? "bg-emerald-50 border-2 border-emerald-200"
                            : "bg-gray-50 hover:bg-gray-100",
                          entry.rank <= 3 && "bg-gradient-to-r",
                          entry.rank === 1 && "from-amber-50 to-yellow-50",
                          entry.rank === 2 && "from-gray-100 to-slate-100",
                          entry.rank === 3 && "from-orange-50 to-amber-50"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xl w-8 text-center">
                            {getRankEmoji(entry.rank)}
                          </span>
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {getInitials(entry.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {entry.name}
                              {entry.id === currentUserId && (
                                <span className="ml-2 text-xs text-emerald-600">(You)</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-800">
                            {entry.value}
                            <span className="text-sm font-normal text-gray-500">
                              {config.unit}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

