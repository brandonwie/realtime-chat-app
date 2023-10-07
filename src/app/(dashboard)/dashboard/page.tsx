import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { FC } from 'react';

interface DashBoardProps {}

const DashBoard: FC<DashBoardProps> = async ({}) => {
  const session = await getServerSession(authOptions);
  return <pre>Dashboard</pre>;
};

export default DashBoard;
