import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const polls = await prisma.poll.findMany({
      orderBy: { createdAt: "desc" },
    })

    return new Response(JSON.stringify({ polls }), {
      status: 200,
    })
  } catch (err) {
    console.error(err)
    return new Response("Error loading polls", { status: 500 })
  }
}
