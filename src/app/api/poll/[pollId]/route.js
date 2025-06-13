import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const { pollId } = params;

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) return new Response('Poll not found', { status: 404 });

    return new Response(JSON.stringify({ poll }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Error fetching poll', { status: 500 });
  }
}
