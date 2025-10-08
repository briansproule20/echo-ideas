import Ideas from '@/app/_components/ideas';
import SignInButton from '@/app/_components/echo/sign-in-button';
import { isSignedIn } from '@/echo';

export default async function IdeasPage() {
  const signedIn = await isSignedIn();

  if (!signedIn) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h2 className="mt-6 font-bold text-3xl text-gray-900 tracking-tight">
              Echo App Ideas
            </h2>
            <p className="mt-2 text-gray-600 text-sm">
              Generate innovative app ideas powered by Echo's AI infrastructure
            </p>
          </div>

          <div className="space-y-4">
            <SignInButton />

            <div className="text-gray-500 text-xs">
              Sign in to start generating app ideas
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Ideas />;
}
