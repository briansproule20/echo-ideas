'use client';

import { useState, useRef, useEffect } from 'react';
import { Heart, X, RotateCcw, Star } from 'lucide-react';
import Image from 'next/image';
import { favoritesStorage } from '@/lib/favorites';

interface AppIdea {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  features: string[];
  aiCapabilities: string;
}

const HotOrNotComponent = () => {
  const [ideas, setIdeas] = useState<AppIdea[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [results, setResults] = useState<{ liked: AppIdea[]; disliked: AppIdea[] }>({
    liked: [],
    disliked: [],
  });
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const cardRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedIdeas = localStorage.getItem('echo-ideas-session');
    if (savedIdeas) {
      try {
        const parsed = JSON.parse(savedIdeas);
        setIdeas(parsed.ideas || []);
        setCurrentIndex(parsed.currentIndex || 0);
        setResults(parsed.results || { liked: [], disliked: [] });
      } catch (error) {
        console.error('Error loading saved ideas:', error);
      }
    }

    // Load favorited ideas
    const favorites = favoritesStorage.getFavorites();
    setFavoriteIds(new Set(favorites.map(fav => fav.id)));
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (ideas.length > 0) {
      const sessionData = {
        ideas,
        currentIndex,
        results,
        timestamp: Date.now(),
      };
      localStorage.setItem('echo-ideas-session', JSON.stringify(sessionData));
    }
  }, [ideas, currentIndex, results]);

  const generateIdeas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ideas');
      }

      const data = await response.json();
      setIdeas(data.ideas);
      setCurrentIndex(0);
      setResults({ liked: [], disliked: [] });
    } catch (error) {
      console.error('Error generating ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= ideas.length) return;

    const currentIdea = ideas[currentIndex];
    setSwipeDirection(direction);

    setTimeout(() => {
      if (direction === 'right') {
        setResults(prev => ({
          ...prev,
          liked: [...prev.liked, currentIdea],
        }));
        // Auto-favorite loved ideas
        if (!favoriteIds.has(currentIdea.id)) {
          favoritesStorage.addFavorite(currentIdea);
          setFavoriteIds(prev => new Set(prev).add(currentIdea.id));
        }
      } else {
        setResults(prev => ({
          ...prev,
          disliked: [...prev.disliked, currentIdea],
        }));
      }

      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const resetSession = () => {
    setIdeas([]);
    setCurrentIndex(0);
    setResults({ liked: [], disliked: [] });
    setSwipeDirection(null);
    localStorage.removeItem('echo-ideas-session');
  };

  const toggleFavorite = (idea: AppIdea) => {
    const isFavorited = favoriteIds.has(idea.id);

    if (isFavorited) {
      favoritesStorage.removeFavorite(idea.id);
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(idea.id);
        return newSet;
      });
    } else {
      favoritesStorage.addFavorite(idea);
      setFavoriteIds(prev => new Set(prev).add(idea.id));
    }
  };

  const currentIdea = ideas[currentIndex];
  const isComplete = currentIndex >= ideas.length && ideas.length > 0;

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-6">
      <div className="relative mb-8 text-center">
        {/* Fresh Ideas button in top right */}
        {ideas.length > 0 && !isLoading && (
          <button
            onClick={resetSession}
            className="absolute right-0 top-0 flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition-all hover:bg-purple-700"
          >
            <RotateCcw className="size-4" />
            Fresh Ideas
          </button>
        )}
      </div>

      {ideas.length === 0 && !isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-8 text-center">
            <h2 className="mb-4 font-semibold text-2xl text-gray-800">
              Ready to discover amazing Echo app ideas?
            </h2>
            <p className="mb-8 text-gray-600">
              Click the button below to generate 10 unique app ideas powered by Echo's infrastructure
            </p>
          </div>
          <button
            onClick={generateIdeas}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-8 py-4 font-semibold text-white transition-all hover:bg-purple-700 hover:scale-105"
          >
            Generate 10 Ideas
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
          <p className="text-gray-600">Generating amazing ideas...</p>
        </div>
      ) : isComplete ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-8 text-center">
            <h2 className="mb-4 font-semibold text-2xl text-gray-800">
              Session Complete! 🎉
            </h2>
            <div className="mb-6 grid grid-cols-2 gap-6">
              <div className="rounded-lg bg-green-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Heart className="size-5 text-green-600" />
                  <span className="font-semibold text-green-800">Loved</span>
                </div>
                <p className="font-bold text-2xl text-green-600">{results.liked.length}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <X className="size-5 text-red-600" />
                  <span className="font-semibold text-red-800">Passed</span>
                </div>
                <p className="font-bold text-2xl text-red-600">{results.disliked.length}</p>
              </div>
            </div>
          </div>
          <button
            onClick={resetSession}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-all hover:bg-purple-700"
          >
            <RotateCcw className="size-5" />
            Generate New Ideas
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-4 text-center">
            <p className="text-gray-600">
              {currentIndex + 1} of {ideas.length}
            </p>
            <div className="mt-2 h-2 w-64 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-purple-600 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / ideas.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="relative mb-8 h-[500px] w-[600px]">
            {/* Left side red X indicator - clickable */}
            <button
              onClick={() => handleSwipe('left')}
              className="absolute -left-20 top-1/2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-red-100 shadow-lg transition-all hover:bg-red-200 hover:scale-110"
            >
              <X className="size-8 text-red-600" />
            </button>

            {/* Right side green heart indicator - clickable */}
            <button
              onClick={() => handleSwipe('right')}
              className="absolute -right-20 top-1/2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-green-100 shadow-lg transition-all hover:bg-green-200 hover:scale-110"
            >
              <Heart className="size-8 text-green-600" />
            </button>

            {currentIdea && (
              <div
                ref={cardRef}
                className={`absolute inset-0 cursor-grab rounded-2xl bg-white border border-gray-100 p-8 shadow-2xl transition-transform duration-300 ${
                  swipeDirection === 'right'
                    ? 'translate-x-96 rotate-12'
                    : swipeDirection === 'left'
                    ? '-translate-x-96 -rotate-12'
                    : ''
                }`}
              >
                <div className="h-full overflow-y-auto">
                  <h3 className="mb-4 font-bold text-2xl text-gray-900 leading-tight">
                    {currentIdea.title}
                  </h3>
                  <p className="mb-6 text-gray-700 text-base leading-relaxed">
                    {currentIdea.description}
                  </p>
                  <div className="mb-4">
                    <span className="font-semibold text-purple-600 text-base">Target Audience</span>
                    <p className="mt-1 text-gray-600 text-base">{currentIdea.targetAudience}</p>
                  </div>
                  <div className="mb-4">
                    <span className="font-semibold text-purple-600 text-base">Key Features</span>
                    <ul className="mt-2 space-y-1 text-gray-600 text-base">
                      {currentIdea.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 font-bold text-purple-500">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-purple-600 text-base">AI Capabilities</span>
                    <p className="mt-1 text-gray-600 text-base leading-relaxed">{currentIdea.aiCapabilities}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotOrNotComponent;