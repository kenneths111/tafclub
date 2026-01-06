import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/food/recent - Get recently logged foods (unique by name)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get recent entries grouped by name with average calories
    const recentEntries = await prisma.foodEntry.groupBy({
      by: ["name"],
      where: {
        userId: session.user.id,
      },
      _avg: {
        calories: true,
        protein: true,
        carbs: true,
        fat: true,
      },
      _count: {
        name: true,
      },
      orderBy: {
        _count: {
          name: "desc",
        },
      },
      take: 10,
    });

    const foods = recentEntries.map((entry) => ({
      name: entry.name,
      calories: Math.round(entry._avg.calories || 0),
      protein: entry._avg.protein ? Math.round(entry._avg.protein) : null,
      carbs: entry._avg.carbs ? Math.round(entry._avg.carbs) : null,
      fat: entry._avg.fat ? Math.round(entry._avg.fat) : null,
      count: entry._count.name,
    }));

    return NextResponse.json({ foods });
  } catch (error) {
    console.error("Error fetching recent foods:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent foods" },
      { status: 500 }
    );
  }
}

