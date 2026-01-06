import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/food - Get food entries for a date range
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const entries = await prisma.foodEntry.findMany({
      where: {
        userId: session.user.id,
        ...(startDate && endDate
          ? {
              loggedAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }
          : {}),
      },
      orderBy: { loggedAt: "desc" },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching food entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch food entries" },
      { status: 500 }
    );
  }
}

// POST /api/food - Create a new food entry
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, calories, protein, carbs, fat, loggedAt } = await request.json();

    if (!name || calories === undefined) {
      return NextResponse.json(
        { error: "Name and calories are required" },
        { status: 400 }
      );
    }

    const entry = await prisma.foodEntry.create({
      data: {
        userId: session.user.id,
        name,
        calories: parseFloat(calories),
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Error creating food entry:", error);
    return NextResponse.json(
      { error: "Failed to create food entry" },
      { status: 500 }
    );
  }
}

// DELETE /api/food - Delete a food entry
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Entry ID required" }, { status: 400 });
    }

    // Verify ownership
    const entry = await prisma.foodEntry.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await prisma.foodEntry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting food entry:", error);
    return NextResponse.json(
      { error: "Failed to delete food entry" },
      { status: 500 }
    );
  }
}

