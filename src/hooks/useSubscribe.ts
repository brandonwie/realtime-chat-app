import { pusherClient } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';
import { useEffect } from 'react';

export async function useSubscribeFriendRequest({
  sessionId,
  callback,
}: {
  sessionId: string;
  callback: (incomingFriendRequest: IncomingFriendRequest) => void;
}) {
  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`),
    );

    pusherClient.bind('incoming_friend_requests', callback);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`),
      );
      pusherClient.unbind('incoming_friend_requests', callback);
    };
  }, [sessionId, callback]);
}

export async function useSubscribeMessageRequest({
  chatId,
  callback,
}: {
  chatId: string;
  callback: (message: Message) => void;
}) {
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    pusherClient.bind('incoming_message', callback);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind('incoming_message', callback);
    };
  }, [chatId, callback]);
}
