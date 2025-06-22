import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { pollId, optionId } = await req.json();

    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll || !poll.isActive) {
      return new Response('Poll not available', { status: 400 });
    }

    await prisma.response.create({
      data: {
        pollId,
        optionId,
      },
    });

    return new Response('Response submitted', { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Error submitting response', { status: 500 });
  }
}
