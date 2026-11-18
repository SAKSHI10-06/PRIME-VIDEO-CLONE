const axios = require('axios');
const Movie = require('../models/Movie');

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_W500 = 'https://image.tmdb.org/t/p/w500';
const TMDB_ORIG = 'https://image.tmdb.org/t/p/original';
const SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const SAMPLE_TRAILER = 'https://www.youtube.com/embed/YE7VzlLtp-4';

const hasTMDB = () => !!(process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.length > 10);
const tmdbHeaders = () => ({ Authorization: `Bearer ${process.env.TMDB_API_KEY}` });

const fmt = (m, type = 'movie') => ({
  tmdbId: m.id,
  title: m.title || m.name,
  description: m.overview || '',
  poster: m.poster_path ? `${TMDB_W500}${m.poster_path}` : '',
  backdrop: m.backdrop_path ? `${TMDB_ORIG}${m.backdrop_path}` : '',
  genres: (m.genre_ids || []).map(String),
  releaseDate: m.release_date || m.first_air_date || '',
  releaseYear: parseInt((m.release_date || m.first_air_date || '0').split('-')[0]) || 0,
  rating: parseFloat((m.vote_average || 0).toFixed(1)),
  popularity: m.popularity || 0,
  voteCount: m.vote_count || 0,
  type,
  videoUrl: SAMPLE_VIDEO,
  trailerUrl: SAMPLE_TRAILER,
  language: m.original_language || 'en',
});

// GET /api/movies
const getMovies = async (req, res, next) => {
  try {
    const { category = 'popular', page = 1, genre, sort = 'popularity', limit = 20 } = req.query;
    if (hasTMDB()) {
      const validCats = ['popular', 'top_rated', 'upcoming', 'now_playing'];
      const ep = validCats.includes(category) ? `/movie/${category}` : '/movie/popular';
      const r = await axios.get(`${TMDB_BASE}${ep}`, { params: { language: 'en-US', page }, headers: tmdbHeaders() });
      return res.json({ success: true, results: r.data.results.map((m) => fmt(m, 'movie')), page: r.data.page, total_pages: r.data.total_pages });
    }
    const query = { type: 'movie' };
    if (genre) query.genres = { $in: [genre] };
    const sortField = sort === 'rating' ? { rating: -1 } : { popularity: -1 };
    const movies = await Movie.find(query).sort(sortField).limit(parseInt(limit));
    res.json({ success: true, results: movies, total: movies.length });
  } catch (error) { next(error); }
};

// GET /api/movies/trending
const getTrending = async (req, res, next) => {
  try {
    if (hasTMDB()) {
      const r = await axios.get(`${TMDB_BASE}/trending/all/week`, { params: { language: 'en-US' }, headers: tmdbHeaders() });
      return res.json({ success: true, results: r.data.results.map((m) => fmt(m, m.media_type === 'tv' ? 'show' : 'movie')) });
    }
    const movies = await Movie.find().sort({ popularity: -1 }).limit(20);
    res.json({ success: true, results: movies });
  } catch (error) { next(error); }
};

// GET /api/movies/search
const searchMovies = async (req, res, next) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query required' });
    if (hasTMDB()) {
      const r = await axios.get(`${TMDB_BASE}/search/multi`, { params: { query: q, language: 'en-US', page }, headers: tmdbHeaders() });
      const results = r.data.results.filter((m) => m.media_type !== 'person').map((m) => fmt(m, m.media_type === 'tv' ? 'show' : 'movie'));
      return res.json({ success: true, results, total_results: r.data.total_results });
    }
    const movies = await Movie.find({ $or: [{ title: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }] }).limit(20);
    res.json({ success: true, results: movies, total_results: movies.length });
  } catch (error) { next(error); }
};

// GET /api/movies/:id
const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (hasTMDB() && !isNaN(id)) {
      const [det, cred, vids] = await Promise.all([
        axios.get(`${TMDB_BASE}/movie/${id}`, { params: { language: 'en-US' }, headers: tmdbHeaders() }),
        axios.get(`${TMDB_BASE}/movie/${id}/credits`, { params: { language: 'en-US' }, headers: tmdbHeaders() }),
        axios.get(`${TMDB_BASE}/movie/${id}/videos`, { params: { language: 'en-US' }, headers: tmdbHeaders() }),
      ]);
      const m = det.data;
      const trailerKey = vids.data.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
      const cast = cred.data.cast.slice(0, 10).map((c) => ({ name: c.name, character: c.character, profilePath: c.profile_path ? `${TMDB_W500}${c.profile_path}` : '' }));
      return res.json({
        success: true,
        movie: {
          tmdbId: m.id, title: m.title, description: m.overview,
          poster: m.poster_path ? `${TMDB_W500}${m.poster_path}` : '',
          backdrop: m.backdrop_path ? `${TMDB_ORIG}${m.backdrop_path}` : '',
          genres: (m.genres || []).map((g) => g.name),
          releaseDate: m.release_date,
          releaseYear: parseInt((m.release_date || '').split('-')[0]) || 0,
          rating: parseFloat((m.vote_average || 0).toFixed(1)),
          duration: m.runtime || 0,
          trailerUrl: trailerKey ? `https://www.youtube.com/embed/${trailerKey.key}` : SAMPLE_TRAILER,
          videoUrl: SAMPLE_VIDEO, cast, type: 'movie',
          tagline: m.tagline || '', voteCount: m.vote_count || 0,
          language: m.original_language,
        },
      });
    }
    const movie = (await Movie.findById(id).catch(() => null)) || (await Movie.findOne({ tmdbId: parseInt(id) }));
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, movie });
  } catch (error) { next(error); }
};

// GET /api/movies/:id/similar
const getSimilar = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (hasTMDB() && !isNaN(id)) {
      const r = await axios.get(`${TMDB_BASE}/movie/${id}/similar`, { params: { language: 'en-US', page: 1 }, headers: tmdbHeaders() });
      return res.json({ success: true, results: r.data.results.map((m) => fmt(m, 'movie')) });
    }
    const movies = await Movie.find({ type: 'movie' }).sort({ rating: -1 }).limit(10);
    res.json({ success: true, results: movies });
  } catch (error) { next(error); }
};

// GET /api/shows
const getShows = async (req, res, next) => {
  try {
    const { category = 'popular', page = 1 } = req.query;
    if (hasTMDB()) {
      const validCats = ['popular', 'top_rated', 'on_the_air', 'airing_today'];
      const ep = validCats.includes(category) ? `/tv/${category}` : '/tv/popular';
      const r = await axios.get(`${TMDB_BASE}${ep}`, { params: { language: 'en-US', page }, headers: tmdbHeaders() });
      return res.json({ success: true, results: r.data.results.map((m) => fmt(m, 'show')) });
    }
    const shows = await Movie.find({ type: 'show' }).sort({ popularity: -1 }).limit(20);
    res.json({ success: true, results: shows });
  } catch (error) { next(error); }
};

// GET /api/shows/:id
const getShowById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (hasTMDB() && !isNaN(id)) {
      const [det, cred, vids] = await Promise.all([
        axios.get(`${TMDB_BASE}/tv/${id}`, { params: { language: 'en-US' }, headers: tmdbHeaders() }),
        axios.get(`${TMDB_BASE}/tv/${id}/credits`, { params: { language: 'en-US' }, headers: tmdbHeaders() }),
        axios.get(`${TMDB_BASE}/tv/${id}/videos`, { params: { language: 'en-US' }, headers: tmdbHeaders() }),
      ]);
      const m = det.data;
      const trailerKey = vids.data.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
      const cast = cred.data.cast.slice(0, 10).map((c) => ({ name: c.name, character: c.character, profilePath: c.profile_path ? `${TMDB_W500}${c.profile_path}` : '' }));
      return res.json({
        success: true,
        movie: {
          tmdbId: m.id, title: m.name, description: m.overview,
          poster: m.poster_path ? `${TMDB_W500}${m.poster_path}` : '',
          backdrop: m.backdrop_path ? `${TMDB_ORIG}${m.backdrop_path}` : '',
          genres: (m.genres || []).map((g) => g.name),
          releaseDate: m.first_air_date,
          releaseYear: parseInt((m.first_air_date || '').split('-')[0]) || 0,
          rating: parseFloat((m.vote_average || 0).toFixed(1)),
          trailerUrl: trailerKey ? `https://www.youtube.com/embed/${trailerKey.key}` : SAMPLE_TRAILER,
          videoUrl: SAMPLE_VIDEO, cast, type: 'show',
          numberOfSeasons: m.number_of_seasons, numberOfEpisodes: m.number_of_episodes,
        },
      });
    }
    const show = (await Movie.findById(id).catch(() => null)) || (await Movie.findOne({ tmdbId: parseInt(id) }));
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
    res.json({ success: true, movie: show });
  } catch (error) { next(error); }
};

// GET /api/movies/genre/:genre
const getByGenre = async (req, res, next) => {
  try {
    const { genre } = req.params;
    const { page = 1 } = req.query;
    if (hasTMDB()) {
      const genreMap = { action: 28, comedy: 35, drama: 18, horror: 27, romance: 10749, 'science fiction': 878, thriller: 53, animation: 16, documentary: 99, fantasy: 14, adventure: 12, crime: 80, mystery: 9648, family: 10751 };
      const genreId = genreMap[genre.toLowerCase()];
      const r = await axios.get(`${TMDB_BASE}/discover/movie`, { params: { language: 'en-US', page, with_genres: genreId, sort_by: 'popularity.desc' }, headers: tmdbHeaders() });
      return res.json({ success: true, results: r.data.results.map((m) => fmt(m, 'movie')) });
    }
    const movies = await Movie.find({ genres: { $in: [genre] }, type: 'movie' }).sort({ popularity: -1 }).limit(20);
    res.json({ success: true, results: movies });
  } catch (error) { next(error); }
};

module.exports = { getMovies, getTrending, searchMovies, getMovieById, getSimilar, getShows, getShowById, getByGenre };
