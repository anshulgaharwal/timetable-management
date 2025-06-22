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

export async function POST(req) {
  try {
    const { title, question, options } = await req.json();

    const poll = await prisma.poll.create({
      data: {
        title,
        question,
        options: {
          create: options.map((text) => ({ text })),
        },
      },
    });

    return new Response(JSON.stringify({ pollId: poll.id }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response('Error creating poll', { status: 500 });
  }
}
