'use client';
import { FC, useRef, useState } from 'react';
import { Message } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface MessagesProps {
  initialMessages: Message[];
  sessionId: string;
}

const Messages: FC<MessagesProps> = ({ initialMessages, sessionId }) => {
  const scrollDownRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  return (
    <div
      id="messages"
      className="flex h-full flex-1 flex-col-reverse gap-4 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />
      {messages.map((message, index) => {
        // sent by me or not
        const isMyMessage = message.senderId === sessionId;
        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;
        return (
          <div
            key={`${message.id}-${message.timestamp}`}
            className="chat-message"
          >
            <div
              className={cn('flex items-end', {
                'justify-end': isMyMessage,
              })}
            >
              <div
                className={cn(
                  'flex flex-col space-y-2 text-base max-w-xs mx-2',
                  {
                    'order-1 items-end': isMyMessage,
                    'order-2 items-start': !isMyMessage,
                  },
                )}
              >
                <span
                  className={cn('px-4 py-2 rounded-lg inline-block', {
                    'bg-indigo-600 text-white': isMyMessage,
                    'bg-gray-200 text-gray-900': !isMyMessage,
                    'rounded-br-none':
                      !hasNextMessageFromSameUser && isMyMessage,
                    'rounded-bl-none':
                      !hasNextMessageFromSameUser && !isMyMessage,
                  })}
                >
                  {message.text}{' '}
                  <span className="ml-2 text-xs text-gray-400">
                    {message.timestamp}
                  </span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
