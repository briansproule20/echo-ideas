'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageSquare, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AppIdea {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  features: string[];
  aiCapabilities: string;
}

const SavedIdeas = () => {
  const [savedIdeas, setSavedIdeas] = useState<AppIdea[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Load saved ideas from localStorage
    const stored = localStorage.getItem('echo-ideas-favorites');
    if (stored) {
      try {
        const ideas = JSON.parse(stored);
        setSavedIdeas(ideas);
      } catch (error) {
        console.error('Error loading saved ideas:', error);
      }
    }
  }, []);

  const handleRemoveIdea = (ideaId: string) => {
    const updated = savedIdeas.filter(idea => idea.id !== ideaId);
    setSavedIdeas(updated);
    localStorage.setItem('echo-ideas-favorites', JSON.stringify(updated));
  };

  const handleSendToChat = (idea: AppIdea) => {
    // Store the idea to be sent to chat
    const chatPrompt = `Help me flesh this idea out and create a plan of action:

**${idea.title}**

${idea.description}

**Target Audience:** ${idea.targetAudience}

**Key Features:**
${idea.features.map((feature: string) => `• ${feature}`).join('\n')}

**AI Capabilities:** ${idea.aiCapabilities}`;

    // Store in sessionStorage to be picked up by chat page
    sessionStorage.setItem('chat-prompt', chatPrompt);
    
    // Navigate to chat
    router.push('/chat');
  };

  if (savedIdeas.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Heart className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Saved Ideas Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start generating ideas and save your favorites by clicking the heart icon!
          </p>
          <a
            href="/ideas"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Generate Ideas
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Saved Ideas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {savedIdeas.length} {savedIdeas.length === 1 ? 'idea' : 'ideas'} saved
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedIdeas.map((idea) => (
          <div
            key={idea.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <Heart className="h-5 w-5 text-red-500 fill-red-500 flex-shrink-0" />
              <button
                onClick={() => handleRemoveIdea(idea.id)}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Remove from saved"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
              {idea.title}
            </h3>

            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
              {idea.description}
            </p>

            <div className="mb-4">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase">
                Target Audience
              </span>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {idea.targetAudience}
              </p>
            </div>

            <div className="mb-4">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase">
                Key Features
              </span>
              <ul className="mt-2 space-y-1">
                {idea.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-400 text-sm flex items-start">
                    <span className="text-amber-500 mr-2 flex-shrink-0">•</span>
                    <span className="line-clamp-1">{feature}</span>
                  </li>
                ))}
                {idea.features.length > 3 && (
                  <li className="text-gray-500 dark:text-gray-500 text-xs italic">
                    +{idea.features.length - 3} more
                  </li>
                )}
              </ul>
            </div>

            <button
              onClick={() => handleSendToChat(idea)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Explore in Chat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedIdeas;

