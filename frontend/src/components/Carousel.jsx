import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function Carousel({ title, movies = [], size = 'md', loading = false }) {
  const ref = useRef(null);

  const scroll = (dir) => {
    if (ref.current) {
      const amount = dir === 'left' ? -600 : 600;
      ref.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (loading) return (
    <div className="mb-10">
      <div className="h-7 w-48 skeleton rounded mb-4" />
      <div className="flex gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-40 flex-shrink-0">
            <div className="aspect-[2/3] skeleton rounded-xl" />
            <div className="h-3 skeleton rounded mt-2 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );

  if (!movies.length) return null;

  return (
    <div className="mb-10 group/carousel">
      <div className="flex items-center justify-between mb-4 px-4 md:px-8">
        <h2 className="text-white text-lg md:text-xl font-bold">{title}</h2>
        <div className="flex gap-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
          <button onClick={() => scroll('left')}
            className="bg-navy-800 hover:bg-navy-700 text-white p-1.5 rounded-full transition-colors border border-white/10">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll('right')}
            className="bg-navy-800 hover:bg-navy-700 text-white p-1.5 rounded-full transition-colors border border-white/10">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto carousel-container px-4 md:px-8 pb-4">
        {movies.map((movie, i) => (
          <MovieCard key={movie._id || movie.tmdbId || i} movie={movie} size={size} />
        ))}
      </div>
    </div>
  );
}
