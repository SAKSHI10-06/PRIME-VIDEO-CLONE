import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SortAsc, SortDesc, ChevronDown } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { movieService } from '../services/movieService';
import { getLocalMovies } from '../data/movies';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Science Fiction', 'Thriller', 'Animation', 'Documentary', 'Fantasy', 'Adventure', 'Crime', 'Mystery', 'Family'];
const CATEGORIES = [
  { label: 'Popular', value: 'popular' },
  { label: 'Top Rated', value: 'top_rated' },
  { label: 'Now Playing', value: 'now_playing' },
  { label: 'Upcoming', value: 'upcoming' },
];

export default function MoviesPage() {
  const [params, setParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [genre, setGenre] = useState(params.get('genre') || '');
  const [category, setCategory] = useState(params.get('category') || 'popular');
  const [sort, setSort] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);

  const fetchMovies = async (reset = false) => {
    setLoading(true);
    try {
      let res;
      const pg = reset ? 1 : page;
      if (genre) {
        res = await movieService.getByGenre(genre);
      } else {
        res = await movieService.getMovies({ category, page: pg, sort });
      }
      const data = res.data.results || [];
      if (reset) setMovies(data);
      else setMovies(prev => [...prev, ...data]);
      setHasMore(data.length >= 18);
      if (reset) setPage(2);
      else setPage(p => p + 1);
    } catch {
      if (reset) setMovies(getLocalMovies());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovies(true); }, [genre, category, sort]);

  const sorted = [...movies].sort((a, b) => sort === 'rating' ? b.rating - a.rating : b.popularity - a.popularity);

  return (
    <div className="min-h-screen bg-navy-950 pt-20 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">Movies</h1>
            <p className="text-gray-400 mt-1">{genre ? `${genre} movies` : `${CATEGORIES.find(c => c.value === category)?.label || 'Popular'} movies`}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Category Selector */}
            {!genre && (
              <div className="relative">
                <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
                  className="bg-navy-800 border border-white/10 text-white text-sm px-4 py-2 rounded-lg appearance-none pr-8 focus:outline-none focus:border-prime cursor-pointer">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}

            {/* Sort */}
            <div className="relative">
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="bg-navy-800 border border-white/10 text-white text-sm px-4 py-2 rounded-lg appearance-none pr-8 focus:outline-none focus:border-prime cursor-pointer">
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Genre Filter Toggle */}
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${showFilters ? 'bg-prime border-prime text-white' : 'bg-navy-800 border-white/10 text-gray-300 hover:text-white'}`}>
              <Filter className="w-4 h-4" /> Genres
            </button>
          </div>
        </div>

        {/* Genre Pills */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-8 p-4 bg-navy-800/50 rounded-xl border border-white/10">
            <button onClick={() => { setGenre(''); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!genre ? 'bg-prime text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
              All
            </button>
            {GENRES.map(g => (
              <button key={g} onClick={() => { setGenre(g === genre ? '' : g); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${genre === g ? 'bg-prime text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                {g}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading && movies.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(18)].map((_, i) => (
              <div key={i}><div className="aspect-[2/3] skeleton rounded-xl" /><div className="h-3 skeleton rounded mt-2 w-3/4" /></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sorted.map((movie, i) => (
              <MovieCard key={movie._id || movie.tmdbId || i} movie={movie} />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && movies.length > 0 && (
          <div className="flex justify-center mt-10">
            <button onClick={() => fetchMovies(false)}
              className="bg-prime hover:bg-prime-dark text-white font-semibold px-8 py-3 rounded-full transition-colors">
              Load More
            </button>
          </div>
        )}

        {loading && movies.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="w-8 h-8 border-2 border-prime border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
