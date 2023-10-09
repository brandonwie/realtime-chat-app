import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: 'ap3',
  useTLS: true, // transport layer security
});

// export const pusherServer = (function () {
//   let message = [];
//   if (!process.env.PUSHER_APP_ID) {
//     message.push('PUSHER_APP_ID');
//   }
//   if (!process.env.PUSHER_KEY) {
//     message.push('PUSHER_KEY');
//   }
//   if (!process.env.PUSHER_SECRET) {
//     message.push('PUSHER_SECRET');
//   }
//
//   if (message.length > 0) {
//     throw new Error(`Please provide ${message.join(', ')} in your .env file`);
//   }
//
//   return new PusherServer({
//     appId: process.env.PUSHER_APP_ID!,
//     key: process.env.PUSHER_KEY!,
//     secret: process.env.PUSHER_SECRET!,
//     cluster: 'ap3',
//     useTLS: true, // transport layer security
//   });
// })();

export const pusherClient = (function () {
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
    throw new Error('Please provide PUSHER_KEY in your .env file');
  }
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: 'ap3',
  });
})();
