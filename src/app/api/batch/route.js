import { prisma } from "@/app/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { degree, course, startYear, endYear } = body;

    // Validate input
    if (!degree || !course || !startYear || !endYear) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const batch = await prisma.batch.create({
      data: {
        degree,
        course,
        startYear: parseInt(startYear),
        endYear: parseInt(endYear),
      },
    });

    return Response.json({ batch });
  } catch (error) {
    console.error('API /batch error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
