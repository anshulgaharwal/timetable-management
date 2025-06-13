import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const { pollId } = params;

  try {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) return new Response('Poll not found', { status: 404 });

    const responses = await prisma.response.groupBy({
      by: ['optionId'],
      where: { pollId },
      _count: true,
    });

    const responsesByOption = poll.options.map((opt) => {
      const res = responses.find((r) => r.optionId === opt.id);
      return {
        optionId: opt.id,
        text: opt.text,
        count: res ? res._count : 0,
      };
    });

    return new Response(JSON.stringify({ poll, responsesByOption }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Error loading results', { status: 500 });
  }
}
