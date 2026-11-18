import api from './api';
import { localMovies, getLocalById, getLocalByGenre, getLocalMovies, getLocalShows, searchLocal } from '../data/movies';

const handleFallback = (localData) => ({ data: { success: true, results: localData } });

export const movieService = {
  getTrending: async () => {
    try { return await api.get('/movies/trending'); }
    catch { return handleFallback([...localMovies].sort((a, b) => b.popularity - a.popularity).slice(0, 10)); }
  },
  getMovies: async (params = {}) => {
    try { return await api.get('/movies', { params }); }
    catch { return handleFallback(getLocalMovies()); }
  },
  getShows: async (params = {}) => {
    try { return await api.get('/shows', { params }); }
    catch { return handleFallback(getLocalShows()); }
  },
  getById: async (id, type = 'movie') => {
    try {
      const endpoint = type === 'show' ? `/shows/${id}` : `/movies/${id}`;
      return await api.get(endpoint);
    } catch {
      const movie = getLocalById(id);
      return { data: { success: true, movie: movie || null } };
    }
  },
  getSimilar: async (id) => {
    try { return await api.get(`/movies/${id}/similar`); }
    catch { return handleFallback(getLocalMovies().slice(0, 8)); }
  },
  search: async (q, page = 1) => {
    try { return await api.get('/movies/search', { params: { q, page } }); }
    catch { return handleFallback(searchLocal(q)); }
  },
  getByGenre: async (genre) => {
    try { return await api.get(`/movies/genre/${genre}`); }
    catch { return handleFallback(getLocalByGenre(genre)); }
  },
};

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const watchlistService = {
  get: () => api.get('/watchlist'),
  add: (movieId, movieData) => api.post('/watchlist', { movieId, movieData }),
  remove: (movieId) => api.delete(`/watchlist/${movieId}`),
  check: (movieId) => api.get(`/watchlist/check/${movieId}`),
};

export const historyService = {
  get: () => api.get('/history'),
  update: (data) => api.post('/history', data),
  remove: (movieId) => api.delete(`/history/${movieId}`),
  clear: () => api.delete('/history'),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updatePassword: (data) => api.put('/users/password', data),
};
