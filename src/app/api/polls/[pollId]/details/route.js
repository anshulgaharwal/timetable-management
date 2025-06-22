import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request, { params }) {
  const { pollId } = params

  try {
    // Get authentication status
    const session = await getServerSession(authOptions)
    
    // Get poll with options and creator information in a single query
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          orderBy: {
            position: 'asc'
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        batch: true,
      },
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Get response counts for each option in a single query
    const responses = await prisma.response.groupBy({
      by: ["optionId"],
      where: { pollId },
      _count: true,
    })

    // Format the response data
    const responsesByOption = poll.options.map((opt) => {
      const res = responses.find((r) => r.optionId === opt.id)
      return {
        optionId: opt.id,
        text: opt.text,
        count: res ? res._count : 0,
      }
    })

    // Check if the current user has voted on this poll
    let userResponse = null
    if (session?.user?.id) {
      userResponse = await prisma.response.findFirst({
        where: {
          pollId,
          userId: session.user.id
        },
        select: {
          optionId: true,
          createdAt: true
        }
      })
    }

    // Get total responses count
    const totalResponses = await prisma.response.count({
      where: { pollId }
    })

    // Check if user has permission to see detailed results
    const canSeeDetailedResults = session?.user?.role === 'admin' || 
                                 session?.user?.role === 'professor' || 
                                 session?.user?.id === poll.creator.id

    // Get detailed response data if user has permission
    let detailedResponses = []
    if (canSeeDetailedResults) {
      detailedResponses = await prisma.response.findMany({
        where: { pollId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          option: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    // Return combined data
    return NextResponse.json({
      poll,
      responsesByOption,
      totalResponses,
      userResponse,
      detailedResponses: canSeeDetailedResults ? detailedResponses : undefined,
      hasVoted: !!userResponse,
      isExpired: poll.expiresAt ? new Date(poll.expiresAt) < new Date() : false,
      canEdit: session?.user?.id === poll.creator.id || session?.user?.role === 'admin'
    })
  } catch (error) {
    console.error("Error fetching poll details:", error)
    return NextResponse.json({ error: "Failed to fetch poll details" }, { status: 500 })
  }
}
