import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Plus, Check, Star, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HeroBanner({ movies = [] }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();

  const goTo = useCallback((idx) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 300);
  }, [animating]);

  useEffect(() => {
    if (!movies.length) return;
    const timer = setInterval(() => {
      goTo((current + 1) % movies.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [current, movies.length, goTo]);

  if (!movies.length) return <div className="h-screen bg-navy-950 skeleton" />;

  const movie = movies[current];
  const movieId = movie.tmdbId || movie._id;
  const inWatchlist = isInWatchlist(movieId);

  const handleWatchlist = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (inWatchlist) await removeFromWatchlist(movieId);
    else await addToWatchlist(movie);
  };

  return (
    <div className="relative w-full h-[85vh] md:h-screen max-h-[900px] overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        {movie.backdrop ? (
          <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover object-center" loading="eager" />
        ) : (
          <div className="w-full h-full bg-navy-900" />
        )}
      </div>

      {/* Gradients */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

      {/* Content */}
      <div className={`absolute inset-0 flex flex-col justify-end pb-20 md:pb-28 px-4 md:px-16 transition-all duration-500 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        {/* Type Badge */}
        {movie.type === 'show' && (
          <div className="inline-flex items-center gap-2 mb-3 w-fit">
            <div className="bg-prime text-white text-xs font-bold px-3 py-1 rounded-full">SERIES</div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-3 leading-tight max-w-3xl drop-shadow-2xl">
          {movie.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 rounded-full">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-300 font-bold text-sm">{movie.rating?.toFixed(1)}</span>
          </div>
          {movie.releaseYear && <span className="text-gray-300 text-sm font-medium">{movie.releaseYear}</span>}
          {movie.duration > 0 && (
            <span className="text-gray-300 text-sm">{movie.type === 'show' ? `${movie.duration}m / ep` : `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`}</span>
          )}
          {movie.genres?.slice(0, 3).map(g => (
            <span key={g} className="text-gray-400 text-sm bg-white/10 px-2 py-0.5 rounded-full">{g}</span>
          ))}
        </div>

        {/* Description */}
        <p className="text-gray-200 text-sm md:text-base max-w-xl line-clamp-3 mb-6 leading-relaxed">
          {movie.description}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate(`/player/${movie.type === 'show' ? 'show' : 'movie'}/${movieId}`)}
            className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl">
            <Play className="w-5 h-5 fill-black" /> Watch Now
          </button>
          <button onClick={() => navigate(`/details/${movie.type === 'show' ? 'show' : 'movie'}/${movieId}`)}
            className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-full hover:bg-white/25 transition-all border border-white/20">
            <Info className="w-5 h-5" /> More Info
          </button>
          <button onClick={handleWatchlist}
            className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-all border ${inWatchlist ? 'bg-prime text-white border-prime hover:bg-prime-dark' : 'bg-transparent text-white border-white/40 hover:border-white/70'}`}>
            {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          </button>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      {movies.length > 1 && (
        <>
          <button onClick={() => goTo((current - 1 + movies.length) % movies.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/10">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => goTo((current + 1) % movies.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-all backdrop-blur-sm border border-white/10">
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {movies.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2 bg-prime' : 'w-2 h-2 bg-white/40 hover:bg-white/60'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
