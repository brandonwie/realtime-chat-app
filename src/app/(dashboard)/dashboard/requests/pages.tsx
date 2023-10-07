import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { FC } from 'react';

interface pagesProps {}

const Requests: FC<pagesProps> = async ({}) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  // ids of people who sent current logged in user a friend request
  const incomingSenderIds = (await fetchRedis(
    'smembers',
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async function (senderId) {
      const sender = (await fetchRedis('get', `user:${senderId}`)) as User;
      return {
        senderId,
        senderEmail: sender.email,
      };
    })
  );

  return <div>Requests</div>;
};

export default Requests;
