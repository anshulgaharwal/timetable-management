import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "You must be logged in to vote" }, { status: 401 });
    }

    const { pollId, optionId } = await req.json();
    
    // Validate input
    if (!pollId || !optionId) {
      return NextResponse.json({ error: "Poll ID and option ID are required" }, { status: 400 });
    }

    // Check if poll exists and is active
    const poll = await prisma.poll.findUnique({ 
      where: { id: pollId },
      include: { options: true }
    });
    
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }
    
    if (!poll.isActive) {
      return NextResponse.json({ error: "This poll is no longer active" }, { status: 400 });
    }
    
    // Check if poll has expired
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This poll has expired" }, { status: 400 });
    }
    
    // Verify the option belongs to this poll
    const validOption = poll.options.some(option => option.id === optionId);
    if (!validOption) {
      return NextResponse.json({ error: "Invalid option for this poll" }, { status: 400 });
    }

    // Check if user has already voted on this poll
    const existingResponse = await prisma.response.findFirst({
      where: {
        pollId,
        userId: session.user.id
      }
    });

    // If multiple votes aren't allowed and user already voted
    if (existingResponse && !poll.allowMultiple) {
      return NextResponse.json({ error: "You have already voted on this poll" }, { status: 400 });
    }

    // If multiple votes are allowed, check if user already selected this specific option
    if (poll.allowMultiple && existingResponse) {
      const duplicateOption = await prisma.response.findFirst({
        where: {
          pollId,
          userId: session.user.id,
          optionId
        }
      });
      
      if (duplicateOption) {
        return NextResponse.json({ error: "You have already selected this option" }, { status: 400 });
      }
    }

    // Create the response
    await prisma.response.create({
      data: {
        pollId,
        optionId,
        userId: session.user.id
      },
    });

    return NextResponse.json({ message: "Response submitted successfully" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error submitting response" }, { status: 500 });
  }
}
