import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Play, Trash2, BookmarkX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function WatchlistPage() {
  const { user, watchlist, removeFromWatchlist } = useAuth();
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">Sign in to view your watchlist</h3>
          <p className="text-gray-400 mb-6">Save movies and shows to watch later</p>
          <Link to="/login" className="bg-prime hover:bg-prime-dark text-white font-semibold px-8 py-3 rounded-full transition-colors">Sign In</Link>
        </div>
      </div>
    );
  }

  const handleRemove = async (movieId) => {
    setRemoving(movieId);
    try { await removeFromWatchlist(movieId); }
    catch (e) { console.error(e); }
    finally { setRemoving(null); }
  };

  return (
    <div className="min-h-screen bg-navy-950 pt-24 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-7 h-7 text-prime fill-prime" />
          <div>
            <h1 className="text-3xl font-black text-white">My Watchlist</h1>
            <p className="text-gray-400 text-sm mt-0.5">{watchlist.length} title{watchlist.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-24">
            <BookmarkX className="w-20 h-20 text-gray-600 mx-auto mb-5" />
            <h3 className="text-white text-xl font-bold mb-2">Your watchlist is empty</h3>
            <p className="text-gray-400 mb-6">Browse movies and add them to watch later</p>
            <Link to="/movies" className="bg-prime hover:bg-prime-dark text-white font-semibold px-8 py-3 rounded-full transition-colors">Browse Movies</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {watchlist.map(item => {
              const m = item.movieData || {};
              const id = item.movieId;
              return (
                <div key={id} className="bg-navy-800 rounded-xl overflow-hidden border border-white/5 group hover:border-prime/30 transition-all">
                  {/* Poster */}
                  <div className="relative aspect-[2/3] overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/details/${m.type || 'movie'}/${id}`)}>
                    {m.poster ? (
                      <img src={m.poster} alt={m.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-navy-900 flex items-center justify-center">
                        <Play className="w-10 h-10 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button onClick={e => { e.stopPropagation(); navigate(`/player/${m.type || 'movie'}/${id}`); }}
                        className="bg-white text-black p-3 rounded-full hover:bg-gray-100 transition-colors">
                        <Play className="w-5 h-5 fill-black" />
                      </button>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-white font-semibold text-sm line-clamp-1">{m.title || 'Unknown'}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-400 text-xs">{m.releaseYear || ''} {m.genres?.[0] ? `· ${m.genres[0]}` : ''}</span>
                      <button onClick={() => handleRemove(id)} disabled={removing === id}
                        className="text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
