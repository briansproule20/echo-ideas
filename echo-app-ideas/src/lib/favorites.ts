interface AppIdea {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  features: string[];
  businessModel: string;
}

const FAVORITES_KEY = 'echo-ideas-favorites';

export const favoritesStorage = {
  getFavorites(): AppIdea[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  },

  addFavorite(idea: AppIdea): void {
    if (typeof window === 'undefined') return;

    try {
      const favorites = this.getFavorites();
      const isAlreadyFavorited = favorites.some(fav => fav.id === idea.id);

      if (!isAlreadyFavorited) {
        const updatedFavorites = [...favorites, idea];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  },

  removeFavorite(ideaId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const favorites = this.getFavorites();
      const updatedFavorites = favorites.filter(fav => fav.id !== ideaId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  },

  isFavorited(ideaId: string): boolean {
    if (typeof window === 'undefined') return false;

    const favorites = this.getFavorites();
    return favorites.some(fav => fav.id === ideaId);
  }
};