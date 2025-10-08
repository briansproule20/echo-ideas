import Ideas from '@/app/_components/ideas';
import SignInButton from '@/app/_components/echo/sign-in-button';
import { isSignedIn } from '@/echo';
import Link from 'next/link';
import { ArrowRight, Sparkles, Lightbulb, MessageSquare, Heart } from 'lucide-react';

export default async function Home() {
  const signedIn = await isSignedIn();

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Echo App Idea
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"> Generator</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Generate innovative app ideas powered by Echo's LLM infrastructure. 
            Discover the next breakthrough in AI-powered applications.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {signedIn ? (
              <>
                <Link
                  href="/ideas"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  Generate Ideas
                </Link>
                <Link
                  href="/saved"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Saved Ideas
                </Link>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Chat
                </Link>
              </>
            ) : (
              <SignInButton />
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Link href="/ideas" className="group">
              <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">AI-Powered Ideas</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm flex-1">
                  Generate unique app concepts using advanced AI models with custom prompting
                </p>
              </div>
            </Link>

            <Link href="/saved" className="group">
              <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Heart className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">Save Favorites</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm flex-1">
                  Save your favorite ideas and explore them further in chat
                </p>
              </div>
            </Link>

            <Link href="/chat" className="group">
              <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">Smart Chat</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm flex-1">
                  Interactive chat interface for exploring and refining your app ideas
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
