import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { movieService } from '../services/movieService';
import { getLocalShows } from '../data/movies';

const CATEGORIES = [
  { label: 'Popular', value: 'popular' },
  { label: 'Top Rated', value: 'top_rated' },
  { label: 'On The Air', value: 'on_the_air' },
  { label: 'Airing Today', value: 'airing_today' },
];

export default function TVShowsPage() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('popular');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await movieService.getShows({ category });
        setShows(res.data.results || []);
      } catch {
        setShows(getLocalShows());
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [category]);

  return (
    <div className="min-h-screen bg-navy-950 pt-20 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">TV Shows</h1>
            <p className="text-gray-400 mt-1">Stream the best TV series</p>
          </div>
          <div className="relative">
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="bg-navy-800 border border-white/10 text-white text-sm px-4 py-2 rounded-lg appearance-none pr-8 focus:outline-none focus:border-prime cursor-pointer">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i}><div className="aspect-[2/3] skeleton rounded-xl" /><div className="h-3 skeleton rounded mt-2 w-3/4" /></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {shows.map((show, i) => <MovieCard key={show._id || show.tmdbId || i} movie={{ ...show, type: 'show' }} />)}
          </div>
        )}
      </div>
    </div>
  );
}
