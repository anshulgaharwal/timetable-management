import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET(req) {
  try {
    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const batchId = searchParams.get("batchId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    
    // Build filter object
    const filter = {}
    if (category) filter.category = category
    if (batchId) filter.batchId = parseInt(batchId)
    
    // Get total count for pagination
    const totalCount = await prisma.poll.count({ where: filter })
    
    // Get polls with pagination and filtering
    const polls = await prisma.poll.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          }
        },
        _count: {
          select: { responses: true }
        }
      }
    })

    return NextResponse.json({ 
      polls, 
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Error loading polls" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check authorization - only admin and professor can create polls
    if (session.user.role !== "admin" && session.user.role !== "professor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { title, question, options, description, category, expiresAt, allowMultiple, batchId } = await req.json();
    
    // Validate input
    if (!title || !question || !options || options.length < 2) {
      return NextResponse.json({ error: "Invalid poll data. Title, question and at least 2 options are required." }, { status: 400 })
    }

    // Create poll with options
    const poll = await prisma.poll.create({
      data: {
        title,
        question,
        description,
        category,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        allowMultiple: allowMultiple || false,
        batchId: batchId ? parseInt(batchId) : null,
        createdById: session.user.id,
        options: {
          create: options.map((text, index) => ({ 
            text, 
            position: index 
          })),
        },
      },
    });

    return NextResponse.json({ pollId: poll.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error creating poll' }, { status: 500 });
  }
}
