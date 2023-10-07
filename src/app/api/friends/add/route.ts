import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailValidator } from '@/lib/validations';
import { AxiosError } from 'axios';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();

    const { email: emailToAdd } = emailValidator.parse(body.email);

    const RESTResponse = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        cache: 'no-store',
      }
    );

    const data = (await RESTResponse.json()) as { result: string };
    const idToAdd = data.result;

    if (!idToAdd) {
      return new Response('User not found', { status: 404 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (idToAdd === session.user.id) {
      return new Response('You cannot add yourself as a a friend', {
        status: 400,
      });
    }

    // check if user is already added
    const isAlreadyAdded = (await fetchRedis(
      'sismember',
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response('Friend request already sent', { status: 400 });
    }

    // check if user is already in my friend list
    const isAlreadyFriends = (await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return new Response('You two are already friends', { status: 400 });
    }

    // valid request, send friend request
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 });
    }

    if (error instanceof AxiosError) {
      return new Response(error.message, { status: error.status });
    }

    return new Response('Unknown Error', { status: 500 });
  }
}
