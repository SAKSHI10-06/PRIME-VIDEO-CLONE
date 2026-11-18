import { useNavigate } from 'react-router-dom';
import { Star, Plus, Check, Play, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MovieCard({ movie, size = 'md' }) {
  const navigate = useNavigate();
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
  const inWatchlist = isInWatchlist(movie.tmdbId || movie._id);

  const handleWatchlistToggle = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try {
      if (inWatchlist) await removeFromWatchlist(movie.tmdbId || movie._id);
      else await addToWatchlist(movie);
    } catch (err) { console.error('Watchlist error:', err); }
  };

  const handleClick = () => {
    const id = movie.tmdbId || movie._id;
    const type = movie.type === 'show' ? 'show' : 'movie';
    navigate(`/details/${type}/${id}`);
  };

  const sizeClasses = {
    sm: 'w-32 md:w-36',
    md: 'w-40 md:w-44',
    lg: 'w-48 md:w-52',
  };

  return (
    <div className={`${sizeClasses[size]} flex-shrink-0 cursor-pointer group relative`} onClick={handleClick}>
      <div className="relative overflow-hidden rounded-xl bg-navy-800 card-hover">
        {/* Poster */}
        <div className="aspect-[2/3] overflow-hidden">
          {movie.poster ? (
            <img src={movie.poster} alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy" onError={e => { e.target.src = `https://via.placeholder.com/200x300/0d1f3c/00a8e1?text=${encodeURIComponent(movie.title?.charAt(0) || '?')}`; }} />
          ) : (
            <div className="w-full h-full bg-navy-800 flex items-center justify-center">
              <Play className="w-12 h-12 text-prime/50" />
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <div className="flex gap-2 mb-2">
            <button onClick={e => { e.stopPropagation(); navigate(`/player/${movie.type === 'show' ? 'show' : 'movie'}/${movie.tmdbId || movie._id}`); }}
              className="flex-1 flex items-center justify-center gap-1 bg-white text-black text-xs font-bold py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
              <Play className="w-3 h-3 fill-black" /> Watch
            </button>
            <button onClick={handleWatchlistToggle}
              className={`p-1.5 rounded-lg transition-colors ${inWatchlist ? 'bg-prime text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={e => { e.stopPropagation(); handleClick(); }}
            className="w-full flex items-center justify-center gap-1 bg-white/10 text-white text-xs py-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <Info className="w-3 h-3" /> More Info
          </button>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-white font-medium">{movie.rating?.toFixed(1)}</span>
        </div>

        {/* Type Badge */}
        {movie.type === 'show' && (
          <div className="absolute top-2 left-2 bg-prime/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">TV</div>
        )}
      </div>

      {/* Title */}
      <div className="mt-2 px-0.5">
        <h3 className="text-white text-xs md:text-sm font-medium line-clamp-1">{movie.title}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-gray-400 text-xs">{movie.releaseYear || (movie.releaseDate && movie.releaseDate.split('-')[0])}</span>
          {movie.genres?.[0] && <span className="text-gray-500 text-xs">• {movie.genres[0]}</span>}
        </div>
      </div>
    </div>
  );
}
