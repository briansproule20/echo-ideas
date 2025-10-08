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

const IdeasComponent = () => {
  const [ideas, setIdeas] = useState<AppIdea[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [results, setResults] = useState<{ liked: AppIdea[]; disliked: AppIdea[] }>({
    liked: [],
    disliked: [],
  });
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [customPrompt, setCustomPrompt] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragFeedback, setDragFeedback] = useState<'love' | 'discard' | null>(null);

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
          customPrompt: customPrompt.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 200)}`);
        }
        throw new Error(errorData.details || errorData.message || 'Failed to generate ideas');
      }

      const data = await response.json();
      setIdeas(data.ideas);
      setCurrentIndex(0);
      setResults({ liked: [], disliked: [] });
    } catch (error) {
      console.error('Error generating ideas:', error);
      alert(`Failed to generate ideas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= ideas.length) return;

    const currentIdea = ideas[currentIndex];
    setSwipeDirection(direction);
    setDragOffset({ x: 0, y: 0 });

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

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    // Only handle horizontal swipes and prevent scroll when horizontal movement is dominant
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20;

    if (isHorizontalSwipe) {
      e.preventDefault(); // Prevent scrolling only for horizontal swipes
      setDragOffset({ x: deltaX, y: deltaY });

      // Update feedback based on drag direction
      const feedbackThreshold = 50;
      if (Math.abs(deltaX) > feedbackThreshold) {
        setDragFeedback(deltaX > 0 ? 'love' : 'discard');
      } else {
        setDragFeedback(null);
      }
    } else {
      // Allow normal scrolling for vertical movement
      setDragOffset({ x: 0, y: 0 });
      setDragFeedback(null);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);
    setDragFeedback(null);

    // Swipe threshold - adjust as needed
    const swipeThreshold = 100;

    if (Math.abs(dragOffset.x) > swipeThreshold) {
      if (dragOffset.x > 0) {
        handleSwipe('right');
      } else {
        handleSwipe('left');
      }
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setDragOffset({ x: deltaX, y: deltaY });

    // Update feedback based on drag direction
    const feedbackThreshold = 50;
    if (Math.abs(deltaX) > feedbackThreshold) {
      setDragFeedback(deltaX > 0 ? 'love' : 'discard');
    } else {
      setDragFeedback(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);
    setDragFeedback(null);

    // Swipe threshold
    const swipeThreshold = 100;

    if (Math.abs(dragOffset.x) > swipeThreshold) {
      if (dragOffset.x > 0) {
        handleSwipe('right');
      } else {
        handleSwipe('left');
      }
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 });
    }
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
    <div className="mx-auto flex h-full max-w-4xl flex-col p-4 sm:p-6">
      {/* Fresh Ideas button - positioned at top right */}
      {ideas.length > 0 && !isLoading && (
        <div className="mb-4 sm:mb-8 flex justify-end">
          <button
            onClick={resetSession}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 sm:px-4 sm:py-2 font-semibold text-white text-sm sm:text-base transition-all hover:bg-amber-600"
          >
            <RotateCcw className="size-3 sm:size-4" />
            Fresh Ideas
          </button>
        </div>
      )}

      {ideas.length === 0 && !isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-8 w-full max-w-2xl text-center">
                <h2 className="mb-4 font-semibold text-2xl text-gray-800 dark:text-white">
                  Ready to discover amazing Echo app ideas?
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
              Click the button below to generate 10 unique app ideas powered by Echo's infrastructure
            </p>
            
            {/* Custom prompt input */}
            <div className="mb-6">
              <label htmlFor="custom-prompt" className="mb-2 block font-medium text-gray-700 dark:text-gray-300 text-left text-sm">
                Custom Prompt (Optional)
              </label>
              <textarea
                id="custom-prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    generateIdeas();
                  }
                }}
                placeholder="e.g., 'Generate ideas for healthcare professionals' or 'Focus on productivity apps for students' (Press Cmd/Ctrl+Enter to generate)"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                rows={3}
              />
              <p className="mt-2 text-gray-500 dark:text-gray-400 text-left text-xs">
                Add specific requirements or focus areas for the AI to consider
              </p>
            </div>
          </div>
          <button
            onClick={generateIdeas}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-8 py-4 font-semibold text-white transition-all hover:bg-amber-600 hover:scale-105"
          >
            Generate 10 Ideas
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-amber-200 dark:border-amber-900 border-t-amber-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Generating amazing ideas...</p>
        </div>
      ) : isComplete ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-8 text-center">
            <h2 className="mb-4 font-semibold text-2xl text-gray-800 dark:text-white">
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
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white transition-all hover:bg-amber-600"
          >
            <RotateCcw className="size-5" />
            Generate New Ideas
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center">
              <div className="mb-4 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {currentIndex + 1} of {ideas.length}
                </p>
            <div className="mt-2 h-2 w-64 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / ideas.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="relative mb-8 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
            {/* Left side red X indicator - clickable - hidden on mobile */}
            <button
              onClick={() => handleSwipe('left')}
              className="absolute -left-12 sm:-left-16 md:-left-20 top-1/2 z-10 hidden sm:flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 -translate-y-1/2 items-center justify-center rounded-full bg-red-100 shadow-lg transition-all hover:bg-red-200 hover:scale-110"
            >
              <X className="size-6 sm:size-7 md:size-8 text-red-600" />
            </button>

            {/* Right side green heart indicator - clickable - hidden on mobile */}
            <button
              onClick={() => handleSwipe('right')}
              className="absolute -right-12 sm:-right-16 md:-right-20 top-1/2 z-10 hidden sm:flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 -translate-y-1/2 items-center justify-center rounded-full bg-green-100 shadow-lg transition-all hover:bg-green-200 hover:scale-110"
            >
              <Heart className="size-6 sm:size-7 md:size-8 text-green-600" />
            </button>

            {currentIdea && (
              <div
                ref={cardRef}
                className={`relative w-full h-[500px] sm:h-[520px] md:h-[550px] cursor-grab rounded-2xl bg-white border border-gray-100 p-4 sm:p-6 md:p-8 shadow-2xl transition-transform duration-300 select-none ${
                  swipeDirection === 'right'
                    ? 'translate-x-96 rotate-12'
                    : swipeDirection === 'left'
                    ? '-translate-x-96 -rotate-12'
                    : isDragging
                    ? 'transition-none'
                    : ''
                } ${
                  dragFeedback === 'love'
                    ? 'bg-green-50 border-green-200'
                    : dragFeedback === 'discard'
                    ? 'bg-red-50 border-red-200'
                    : ''
                }`}
                style={{
                  transform: isDragging && !swipeDirection
                    ? `translate(${dragOffset.x}px, ${dragOffset.y * 0.1}px) rotate(${dragOffset.x * 0.1}deg)`
                    : undefined
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >

                {/* Drag feedback overlay */}
                {dragFeedback && (
                  <div className={`absolute top-4 right-4 pointer-events-none transition-opacity duration-200`}>
                    <div className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 rounded-full font-bold text-xs sm:text-sm ${
                      dragFeedback === 'love'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {dragFeedback === 'love' ? (
                        <><Heart className="size-3 sm:size-4" /> LOVE</>
                      ) : (
                        <><X className="size-3 sm:size-4" /> PASS</>
                      )}
                    </div>
                  </div>
                )}
                <div className="h-full overflow-y-auto">
                  <h3 className="mb-3 sm:mb-4 font-bold text-xl sm:text-2xl text-gray-900 leading-tight">
                    {currentIdea.title}
                  </h3>
                  <p className="mb-4 sm:mb-6 text-gray-700 text-sm sm:text-base leading-relaxed">
                    {currentIdea.description}
                  </p>
                  <div className="mb-3 sm:mb-4">
                    <span className="font-semibold text-purple-600 text-sm sm:text-base">Target Audience</span>
                    <p className="mt-1 text-gray-600 text-sm sm:text-base">{currentIdea.targetAudience}</p>
                  </div>
                  <div className="mb-3 sm:mb-4">
                    <span className="font-semibold text-purple-600 text-sm sm:text-base">Key Features</span>
                    <ul className="mt-2 space-y-1 text-gray-600 text-sm sm:text-base">
                      {currentIdea.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 font-bold text-purple-500">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-purple-600 text-sm sm:text-base">AI Capabilities</span>
                    <p className="mt-1 text-gray-600 text-sm sm:text-base leading-relaxed">{currentIdea.aiCapabilities}</p>
                  </div>
                </div>


              </div>
            )}
          </div>

          {/* Mobile action buttons below the card */}
          <div className="flex justify-center gap-8 mt-6 sm:hidden">
            <button
              onClick={() => handleSwipe('left')}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 shadow-lg transition-all active:scale-95 hover:bg-red-200"
              title="Pass"
            >
              <X className="size-7 text-red-600" />
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 shadow-lg transition-all active:scale-95 hover:bg-green-200"
              title="Love"
            >
              <Heart className="size-7 text-green-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeasComponent;