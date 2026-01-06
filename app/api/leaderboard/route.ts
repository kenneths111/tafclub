import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from "date-fns";

interface LeaderboardEntry {
  id: string;
  name: string;
  value: number;
  rank: number;
}

// GET /api/leaderboard - Get leaderboard data
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "streak"; // streak, weekly_calories, weight_loss

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        foodEntries: true,
        weightEntries: {
          orderBy: { loggedAt: "desc" },
          take: 10,
        },
      },
    });

    let leaderboard: LeaderboardEntry[] = [];

    switch (type) {
      case "streak": {
        // Calculate streak for each user
        leaderboard = users
          .map((user) => {
            const dates = user.foodEntries.map((e) => startOfDay(e.loggedAt));
            const uniqueDates = [...new Set(dates.map((d) => d.getTime()))].sort(
              (a, b) => b - a
            );

            let streak = 0;
            const today = startOfDay(new Date()).getTime();
            const yesterday = startOfDay(subDays(new Date(), 1)).getTime();

            if (uniqueDates.length > 0) {
              const mostRecent = uniqueDates[0];
              if (mostRecent === today || mostRecent === yesterday) {
                streak = 1;
                for (let i = 1; i < uniqueDates.length; i++) {
                  const diff =
                    (uniqueDates[i - 1] - uniqueDates[i]) / (1000 * 60 * 60 * 24);
                  if (diff === 1) {
                    streak++;
                  } else {
                    break;
                  }
                }
              }
            }

            return {
              id: user.id,
              name: user.name,
              value: streak,
              rank: 0,
            };
          })
          .sort((a, b) => b.value - a.value);
        break;
      }

      case "weekly_calories": {
        // Get total calories logged this week
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

        leaderboard = users
          .map((user) => {
            const weeklyCalories = user.foodEntries
              .filter(
                (e) =>
                  e.loggedAt >= weekStart && e.loggedAt <= weekEnd
              )
              .reduce((sum, e) => sum + e.calories, 0);

            return {
              id: user.id,
              name: user.name,
              value: Math.round(weeklyCalories),
              rank: 0,
            };
          })
          .sort((a, b) => b.value - a.value);
        break;
      }

      case "weight_loss": {
        // Calculate weight change (first entry vs last entry)
        leaderboard = users
          .map((user) => {
            const entries = user.weightEntries;
            if (entries.length < 2) {
              return { id: user.id, name: user.name, value: 0, rank: 0 };
            }

            const latest = entries[0].weight;
            const oldest = entries[entries.length - 1].weight;
            const change = oldest - latest; // Positive = weight lost

            return {
              id: user.id,
              name: user.name,
              value: parseFloat(change.toFixed(1)),
              rank: 0,
            };
          })
          .sort((a, b) => b.value - a.value);
        break;
      }

      case "today_calories": {
        // Get calories logged today
        const today = new Date();
        const dayStart = startOfDay(today);
        const dayEnd = endOfDay(today);

        leaderboard = users
          .map((user) => {
            const todayCalories = user.foodEntries
              .filter((e) => e.loggedAt >= dayStart && e.loggedAt <= dayEnd)
              .reduce((sum, e) => sum + e.calories, 0);

            return {
              id: user.id,
              name: user.name,
              value: Math.round(todayCalories),
              rank: 0,
            };
          })
          .sort((a, b) => b.value - a.value);
        break;
      }

      default:
        leaderboard = [];
    }

    // Assign ranks
    leaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Mark current user
    const currentUserId = session.user.id;

    return NextResponse.json({
      leaderboard,
      currentUserId,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

