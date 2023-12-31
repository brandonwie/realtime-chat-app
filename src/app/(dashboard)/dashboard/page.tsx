import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id';
import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { chatHrefConstructor } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { getServerSession } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';

interface DashBoardProps {}

const DashBoard: FC<DashBoardProps> = async ({}) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const friends = await getFriendsByUserId(session.user.id);

  const friendsWithLastMessage = await Promise.all(
    friends.map(async function (friend) {
      const [lastMessage] = await fetchRedis(
        'zrange',
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        -1,
        -1,
      );
      return {
        ...friend,
        lastMessage: JSON.parse(lastMessage) as Message[],
      };
    }),
  );
  return (
    <div className="container py-12">
      <h1 className="font-bold text-5xl mb-8">Recent chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendsWithLastMessage.map((friend) => (
          <div
            key={friend.id}
            className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-medium"
          >
            <div className="absolute right-4 inset-y-0 flex items-center">
              <ChevronRight className="w-7 h-7 text-zinc-400" />
            </div>

            <Link
              className="relative sm:flex"
              href={`/dashboard/chat/${chatHrefConstructor(
                session.user.id,
                friend.id,
              )}`}
            >
              <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                <div className="relative h-6 w-6">
                  <Image
                    fill
                    referrerPolicy="no-referrer"
                    src={friend.image}
                    className="rounded-full"
                    alt={`${friend.name} profile picture}`}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold">{friend.name}</h4>
                <p className="mt-1 max-w-md">
                  <span className="text-zinc-400">
                    {friend.lastMessage?.senderId === session.user.id
                      ? 'You: '
                      : ''}
                  </span>
                  {friend.lastMessage.text}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default DashBoard;
