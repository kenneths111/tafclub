import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/challenges - Get all challenges
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const challenges = await prisma.challenge.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Add isParticipant and isCreator flags
    const enrichedChallenges = challenges.map((challenge) => ({
      ...challenge,
      isParticipant: challenge.participants.some(
        (p) => p.userId === session.user?.id
      ),
      isCreator: challenge.createdById === session.user?.id,
      participantCount: challenge.participants.length,
    }));

    return NextResponse.json({ challenges: enrichedChallenges });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}

// POST /api/challenges - Create a new challenge
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, startDate, endDate, goalType, goalValue } =
      await request.json();

    if (!name || !startDate || !endDate || !goalType || goalValue === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create challenge and auto-join the creator
    const challenge = await prisma.challenge.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        goalType,
        goalValue: parseFloat(goalValue),
        createdById: session.user.id,
        participants: {
          create: {
            userId: session.user.id,
            progress: 0,
          },
        },
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 }
    );
  }
}

