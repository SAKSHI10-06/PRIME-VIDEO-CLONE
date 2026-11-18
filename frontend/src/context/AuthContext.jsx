import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, watchlistService, historyService } from '../services/movieService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('primeplay_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('primeplay_token'));
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const saveAuth = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('primeplay_user', JSON.stringify(userData));
    localStorage.setItem('primeplay_token', tokenData);
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setWatchlist([]);
    setHistory([]);
    localStorage.removeItem('primeplay_user');
    localStorage.removeItem('primeplay_token');
  }, []);

  // Listen for 401 global logout
  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, [logout]);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.data.user);
          localStorage.setItem('primeplay_user', JSON.stringify(res.data.user));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  // Load watchlist & history when user logs in
  useEffect(() => {
    if (user && token) {
      watchlistService.get().then(res => setWatchlist(res.data.watchlist || [])).catch(() => {});
      historyService.get().then(res => setHistory(res.data.history || [])).catch(() => {});
    }
  }, [user, token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { user: userData, token: tokenData } = res.data;
    saveAuth(userData, tokenData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    const { user: userData, token: tokenData } = res.data;
    saveAuth(userData, tokenData);
    return userData;
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('primeplay_user', JSON.stringify(userData));
  };

  const addToWatchlist = async (movie) => {
    const movieId = movie.tmdbId || movie._id;
    const movieData = { title: movie.title, poster: movie.poster, backdrop: movie.backdrop, rating: movie.rating, releaseYear: movie.releaseYear, genres: movie.genres, type: movie.type, duration: movie.duration };
    await watchlistService.add(movieId, movieData);
    setWatchlist(prev => [...prev, { movieId: String(movieId), movieData }]);
  };

  const removeFromWatchlist = async (movieId) => {
    await watchlistService.remove(movieId);
    setWatchlist(prev => prev.filter(w => w.movieId !== String(movieId)));
  };

  const isInWatchlist = (movieId) => watchlist.some(w => w.movieId === String(movieId));

  const updateHistory = async (movieId, playbackPosition, duration, movieData) => {
    await historyService.update({ movieId, playbackPosition, duration, movieData });
    setHistory(prev => {
      const idx = prev.findIndex(h => h.movieId === String(movieId));
      const item = { movieId: String(movieId), playbackPosition, duration, lastWatched: new Date(), movieData };
      if (idx >= 0) { const next = [...prev]; next[idx] = item; return next; }
      return [item, ...prev];
    });
  };

  const removeHistory = async (movieId) => {
    await historyService.remove(movieId);
    setHistory(prev => prev.filter(h => h.movieId !== String(movieId)));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, watchlist, history, login, register, logout, updateUser, addToWatchlist, removeFromWatchlist, isInWatchlist, updateHistory, removeHistory }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
