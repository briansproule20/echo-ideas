import HotOrNotComponent from '@/app/_components/hot-or-not';
import { isSignedIn } from '@/echo';
import { redirect } from 'next/navigation';

export default async function HotOrNotPage() {
  const signedIn = await isSignedIn();

  if (!signedIn) {
    redirect('/');
  }

  return <HotOrNotComponent />;
}