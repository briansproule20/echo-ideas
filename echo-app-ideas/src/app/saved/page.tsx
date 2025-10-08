import SavedIdeas from '@/app/_components/saved-ideas';
import SignInButton from '@/app/_components/echo/sign-in-button';
import { isSignedIn } from '@/echo';

export default async function SavedPage() {
  const signedIn = await isSignedIn();

  if (!signedIn) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h2 className="mt-6 font-bold text-3xl text-gray-900 dark:text-white tracking-tight">
              Saved Ideas
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              View and explore your favorite Echo app ideas
            </p>
          </div>

          <div className="space-y-4">
            <SignInButton />

            <div className="text-gray-500 dark:text-gray-400 text-xs">
              Sign in to view your saved ideas
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <SavedIdeas />;
}

