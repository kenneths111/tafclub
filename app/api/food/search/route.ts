import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

interface OpenFoodFactsProduct {
  product_name?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
  serving_size?: string;
}

interface SearchResult {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize?: string;
}

// GET /api/food/search - Search for foods in OpenFoodFacts
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // Search OpenFoodFacts API
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query
      )}&search_simple=1&action=process&json=1&page_size=10`,
      {
        headers: {
          "User-Agent": "TAFClub-CalorieTracker/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search OpenFoodFacts");
    }

    const data = await response.json();
    const products = data.products || [];

    const results: SearchResult[] = products
      .filter(
        (p: OpenFoodFactsProduct) =>
          p.product_name && p.nutriments?.["energy-kcal_100g"]
      )
      .map((p: OpenFoodFactsProduct) => ({
        name: p.product_name || "Unknown",
        calories: Math.round(p.nutriments?.["energy-kcal_100g"] || 0),
        protein: p.nutriments?.proteins_100g
          ? Math.round(p.nutriments.proteins_100g)
          : undefined,
        carbs: p.nutriments?.carbohydrates_100g
          ? Math.round(p.nutriments.carbohydrates_100g)
          : undefined,
        fat: p.nutriments?.fat_100g
          ? Math.round(p.nutriments.fat_100g)
          : undefined,
        servingSize: p.serving_size || "per 100g",
      }))
      .slice(0, 10);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error searching foods:", error);
    return NextResponse.json(
      { error: "Failed to search foods" },
      { status: 500 }
    );
  }
}

