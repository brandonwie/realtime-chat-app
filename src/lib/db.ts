import { Redis } from '@upstash/redis';

export const db = (function () {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    var str = '';
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      str += 'UPSTASH_REDIS_REST_URL ';
    }
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      str += 'UPSTASH_REDIS_REST_TOKEN ';
    }
    throw new Error('Environment variables not set: ' + str);
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
})();
