import IdeasComponent from '@/app/_components/ideas';
import { isSignedIn } from '@/echo';
import { redirect } from 'next/navigation';

export default async function IdeasPage() {
  const signedIn = await isSignedIn();

  if (!signedIn) {
    redirect('/');
  }

  return <IdeasComponent />;
}