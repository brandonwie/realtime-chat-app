import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { emailValidator } from '@/lib/validations';
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
    console.log({ RESTResponse: data });
    const idToAdd = data.result;

    if (!idToAdd) {
      return new Response('User not found', { status: 404 });
    }

    const session = await getServerSession(authOptions);

    console.log({ session });

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
    console.log({ isAlreadyAdded });

    if (isAlreadyAdded) {
      return new Response('Friend request already sent', { status: 400 });
    }

    // check if user is already in my friend list
    const isAlreadyFriends = (await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;
    console.log({ isAlreadyFriends });

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

    return new Response('Invalid request', { status: 400 });
  }
}
