import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';
import { AxiosError } from 'axios';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();

    const { id: idToAccept } = z
      .object({
        id: z.string(),
      })
      .parse(body);
    // NOTE validate request
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    // are they friends already?
    const isAlreadyMyFriend = await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAccept,
    );

    if (isAlreadyMyFriend) {
      return new Response('You are already friends', { status: 400 });
    }

    // has the user sent a friend request?
    const hasTargetSentFriendRequest = await fetchRedis(
      'sismember',
      `user:${session.user.id}:incoming_friend_requests`,
      idToAccept,
    );

    if (!hasTargetSentFriendRequest) {
      return new Response('No friend request found', { status: 400 });
    }

    // NOTE notify added user
    pusherServer.trigger(
      toPusherKey(`user:${idToAccept}:friend`),
      'new_friend',
      {},
    );

    // add the friend who requested to the my friends list
    await db.sadd(`user:${session.user.id}:friends`, idToAccept);
    // vice-versa
    await db.sadd(`user:${idToAccept}:friends`, session.user.id);

    // await db.srem(
    //   `user:${idToAccept}:outbound_friend_requests`,
    //   session.user.id
    // );

    // remove the friend request
    await db.srem(
      `user:${session.user.id}:incoming_friend_requests`,
      idToAccept,
    );

    return new Response('OK', { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 });
    }
    if (error instanceof AxiosError) {
      return new Response(error.message, {
        status: error.status,
      });
    }

    return new Response('Unknown error', { status: 500 });
  }
}
