import AddFriendButton from '@/components/ui/AddFriendButton';
import { FC } from 'react';

interface AddProps {}

const Add: FC<AddProps> = ({}) => {
  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
      <AddFriendButton />
    </main>
  );
};

export default Add;
