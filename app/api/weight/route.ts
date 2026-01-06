import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/weight - Get weight entries
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const entries = await prisma.weightEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { loggedAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching weight entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch weight entries" },
      { status: 500 }
    );
  }
}

// POST /api/weight - Create a new weight entry
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weight, loggedAt } = await request.json();

    if (weight === undefined || weight <= 0) {
      return NextResponse.json(
        { error: "Valid weight is required" },
        { status: 400 }
      );
    }

    const entry = await prisma.weightEntry.create({
      data: {
        userId: session.user.id,
        weight: parseFloat(weight),
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Error creating weight entry:", error);
    return NextResponse.json(
      { error: "Failed to create weight entry" },
      { status: 500 }
    );
  }
}

// DELETE /api/weight - Delete a weight entry
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
    const entry = await prisma.weightEntry.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await prisma.weightEntry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting weight entry:", error);
    return NextResponse.json(
      { error: "Failed to delete weight entry" },
      { status: 500 }
    );
  }
}

