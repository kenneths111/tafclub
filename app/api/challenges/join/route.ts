import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/challenges/join - Join a challenge
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { challengeId } = await request.json();

    if (!challengeId) {
      return NextResponse.json(
        { error: "Challenge ID is required" },
        { status: 400 }
      );
    }

    // Check if challenge exists
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Check if already participating
    const existingParticipant = await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: session.user.id,
        },
      },
    });

    if (existingParticipant) {
      return NextResponse.json(
        { error: "Already participating in this challenge" },
        { status: 400 }
      );
    }

    // Join the challenge
    const participant = await prisma.challengeParticipant.create({
      data: {
        challengeId,
        userId: session.user.id,
        progress: 0,
      },
    });

    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    console.error("Error joining challenge:", error);
    return NextResponse.json(
      { error: "Failed to join challenge" },
      { status: 500 }
    );
  }
}

// DELETE /api/challenges/join - Leave a challenge
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get("challengeId");

    if (!challengeId) {
      return NextResponse.json(
        { error: "Challenge ID is required" },
        { status: 400 }
      );
    }

    // Check if participating
    const participant = await prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId: session.user.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Not participating in this challenge" },
        { status: 400 }
      );
    }

    await prisma.challengeParticipant.delete({
      where: { id: participant.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving challenge:", error);
    return NextResponse.json(
      { error: "Failed to leave challenge" },
      { status: 500 }
    );
  }
}

