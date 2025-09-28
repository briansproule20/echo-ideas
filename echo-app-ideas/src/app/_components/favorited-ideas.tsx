'use client';

import { useState, useEffect } from 'react';
import { Star, X, Heart } from 'lucide-react';
import { favoritesStorage } from '@/lib/favorites';

interface AppIdea {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  features: string[];
  businessModel: string;
}

const FavoritedIdeas = () => {
  const [favorites, setFavorites] = useState<AppIdea[]>([]);

  useEffect(() => {
    loadFavorites();

    // Listen for storage changes to update favorites in real-time
    const handleStorageChange = () => {
      loadFavorites();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadFavorites = () => {
    const storedFavorites = favoritesStorage.getFavorites();
    setFavorites(storedFavorites);
  };

  const removeFavorite = (ideaId: string) => {
    favoritesStorage.removeFavorite(ideaId);
    setFavorites(prev => prev.filter(idea => idea.id !== ideaId));
  };

  if (favorites.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white/50 backdrop-blur-sm p-6 text-center shadow-sm">
        <Heart className="mx-auto mb-3 size-8 text-gray-400" />
        <p className="text-gray-600 text-base font-medium">
          Your loved ideas will appear here
        </p>
        <p className="mt-1 text-gray-500 text-sm">
          Heart ideas you like on the main page to save them for reference
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white/50 backdrop-blur-sm p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900 text-lg">
        <Heart className="size-6 fill-red-400 text-red-400" />
        Your Loved Ideas ({favorites.length})
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((idea) => (
          <div
            key={idea.id}
            className="group relative rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:border-gray-300"
          >
            <button
              onClick={() => removeFavorite(idea.id)}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 opacity-0 transition-all hover:bg-red-200 group-hover:opacity-100"
            >
              <X className="size-3 text-red-600" />
            </button>

            <h4 className="mb-2 font-semibold text-gray-900 text-sm line-clamp-2">
              {idea.title}
            </h4>
            <p className="mb-3 text-gray-600 text-xs line-clamp-3">
              {idea.description}
            </p>

            <div className="space-y-2">
              <div>
                <span className="font-medium text-purple-600 text-xs">Target:</span>
                <p className="text-gray-600 text-xs line-clamp-1">{idea.targetAudience}</p>
              </div>

              <div>
                <span className="font-medium text-purple-600 text-xs">Features:</span>
                <ul className="mt-1 text-gray-600 text-xs">
                  {idea.features.slice(0, 2).map((feature, index) => (
                    <li key={index} className="line-clamp-1">
                      • {feature}
                    </li>
                  ))}
                  {idea.features.length > 2 && (
                    <li className="text-gray-400">
                      +{idea.features.length - 2} more
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritedIdeas;