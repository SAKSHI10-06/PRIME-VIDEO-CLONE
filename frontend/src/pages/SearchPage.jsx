import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { movieService } from '../services/movieService';
import { searchLocal } from '../data/movies';

const GENRES = ['Action','Comedy','Drama','Horror','Romance','Science Fiction','Thriller','Animation','Documentary','Fantasy','Adventure','Crime'];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [inputVal, setInputVal] = useState(params.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('popularity');

  useEffect(() => {
    const q = params.get('q') || '';
    setQuery(q);
    setInputVal(q);
  }, [params]);

  useEffect(() => {
    if (!query) { setResults([]); return; }
    const run = async () => {
      setLoading(true);
      try {
        const res = await movieService.search(query);
        setResults(res.data.results || []);
      } catch {
        setResults(searchLocal(query));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputVal.trim()) setParams({ q: inputVal.trim() });
  };

  const filtered = results
    .filter(m => !genre || m.genres?.some(g => g.toLowerCase() === genre.toLowerCase()))
    .sort((a, b) => sort === 'rating' ? b.rating - a.rating : b.popularity - a.popularity);

  return (
    <div className="min-h-screen bg-navy-950 pt-24 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
              placeholder="Search for movies, TV shows..."
              className="w-full bg-navy-800 border border-white/10 text-white placeholder-gray-500 pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-prime transition-colors text-base" />
            {inputVal && (
              <button type="button" onClick={() => { setInputVal(''); setParams({}); setResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button type="submit" className="bg-prime hover:bg-prime-dark text-white font-semibold px-6 py-3.5 rounded-xl transition-colors">
            Search
          </button>
        </form>

        {/* Filters */}
        {results.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative">
              <select value={genre} onChange={e => setGenre(e.target.value)}
                className="bg-navy-800 border border-white/10 text-white text-sm px-4 py-2 rounded-lg appearance-none pr-8 focus:outline-none focus:border-prime cursor-pointer">
                <option value="">All Genres</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="bg-navy-800 border border-white/10 text-white text-sm px-4 py-2 rounded-lg appearance-none pr-8 focus:outline-none focus:border-prime cursor-pointer">
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div>
            <div className="h-5 skeleton w-32 rounded mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => <div key={i}><div className="aspect-[2/3] skeleton rounded-xl" /></div>)}
            </div>
          </div>
        ) : query && filtered.length === 0 ? (
          <div className="text-center py-24">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">No results found</h3>
            <p className="text-gray-400">Try searching for a different title or genre</p>
          </div>
        ) : !query ? (
          <div className="text-center py-24">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">Search for anything</h3>
            <p className="text-gray-400">Find movies, TV shows and more</p>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-6">
              {filtered.length} results for <span className="text-white font-semibold">"{query}"</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered.map((movie, i) => <MovieCard key={movie._id || movie.tmdbId || i} movie={movie} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
