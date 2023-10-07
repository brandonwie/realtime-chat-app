import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AxiosError } from 'axios';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id: idToDeny } = z
      .object({
        id: z.string(),
      })
      .parse(body);

    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny);

    return new Response('OK', { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    if (error instanceof AxiosError) {
      return new Response(error.message, { status: error.status });
    }

    return new Response(`Unknown error: ${JSON.stringify(error, null, 2)}`, {
      status: 500,
    });
  }
}
