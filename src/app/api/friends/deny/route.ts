import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }
  } catch (error) {}
}
