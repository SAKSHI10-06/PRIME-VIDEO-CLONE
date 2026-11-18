import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Plus, Check, Star, Clock, Calendar, ArrowLeft, Tv } from 'lucide-react';
import { movieService } from '../services/movieService';
import { getLocalById, getLocalMovies } from '../data/movies';
import { useAuth } from '../context/AuthContext';
import Carousel from '../components/Carousel';

export default function MovieDetailPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  const inWatchlist = isInWatchlist(movie?.tmdbId || movie?._id);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await movieService.getById(id, type);
        setMovie(res.data.movie);
        if (type === 'movie') {
          const sim = await movieService.getSimilar(id);
          setSimilar(sim.data.results?.slice(0, 10) || []);
        }
      } catch {
        const local = getLocalById(id);
        setMovie(local);
        setSimilar(getLocalMovies().slice(0, 8));
      } finally {
        setLoading(false);
      }
    };
    fetch();
    window.scrollTo(0, 0);
  }, [id, type]);

  const handleWatchlist = async () => {
    if (!user) { navigate('/login'); return; }
    if (inWatchlist) await removeFromWatchlist(movie.tmdbId || movie._id);
    else await addToWatchlist(movie);
  };

  if (loading) return (
    <div className="min-h-screen bg-navy-950 pt-20">
      <div className="h-96 skeleton" />
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 space-y-4">
        <div className="h-10 skeleton w-1/2 rounded" />
        <div className="h-4 skeleton w-1/4 rounded" />
        <div className="h-24 skeleton rounded" />
      </div>
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-xl mb-4">Movie not found</p>
        <Link to="/movies" className="text-prime hover:underline">Browse Movies</Link>
      </div>
    </div>
  );

  const movieId = movie.tmdbId || movie._id;

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Backdrop */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        {movie.backdrop && <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover object-top" />}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-black/40" />

        <button onClick={() => navigate(-1)}
          className="absolute top-24 left-4 md:left-8 flex items-center gap-2 text-white/80 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Detail Content */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 -mt-56 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-40 md:w-56 mx-auto md:mx-0">
            {movie.poster ? (
              <img src={movie.poster} alt={movie.title} className="w-full rounded-2xl shadow-2xl shadow-black/50 border border-white/10" />
            ) : (
              <div className="w-full aspect-[2/3] bg-navy-800 rounded-2xl flex items-center justify-center">
                <Play className="w-16 h-16 text-prime/50" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            {/* Type */}
            {type === 'show' && <div className="inline-flex items-center gap-1.5 bg-prime/20 border border-prime/40 text-prime text-xs font-bold px-3 py-1 rounded-full mb-3"><Tv className="w-3 h-3" /> TV SERIES</div>}

            <h1 className="text-3xl md:text-5xl font-black text-white mb-2">{movie.title}</h1>
            {movie.tagline && <p className="text-gray-400 italic text-lg mb-4">"{movie.tagline}"</p>}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-300 font-bold">{movie.rating?.toFixed(1)}</span>
                {movie.voteCount > 0 && <span className="text-gray-400 text-xs">({movie.voteCount?.toLocaleString()})</span>}
              </div>
              {movie.releaseDate && (
                <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" /> {new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}
              {movie.duration > 0 && (
                <div className="flex items-center gap-1.5 text-gray-300 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {type === 'show' ? `${movie.duration}m / episode` : `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`}
                </div>
              )}
              {movie.numberOfSeasons && <span className="text-gray-300 text-sm">{movie.numberOfSeasons} Season{movie.numberOfSeasons > 1 ? 's' : ''}</span>}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(movie.genres || []).map(g => (
                <span key={g} className="bg-white/10 text-gray-200 text-sm px-3 py-1 rounded-full border border-white/10">{g}</span>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-200 text-base leading-relaxed mb-7 max-w-2xl">{movie.description}</p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button onClick={() => navigate(`/player/${type}/${movieId}`)}
                className="flex items-center gap-2 bg-white text-black font-bold px-7 py-3 rounded-full hover:bg-gray-100 transition-all hover:scale-105 shadow-xl">
                <Play className="w-5 h-5 fill-black" /> Watch Now
              </button>
              <button onClick={handleWatchlist}
                className={`flex items-center gap-2 font-semibold px-7 py-3 rounded-full transition-all border ${inWatchlist ? 'bg-prime text-white border-prime' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}>
                {inWatchlist ? <><Check className="w-5 h-5" /> In Watchlist</> : <><Plus className="w-5 h-5" /> Add to Watchlist</>}
              </button>
              {movie.trailerUrl && (
                <button onClick={() => setShowTrailer(!showTrailer)}
                  className="flex items-center gap-2 bg-navy-800 text-white font-semibold px-7 py-3 rounded-full hover:bg-navy-700 transition-colors border border-white/10">
                  🎬 {showTrailer ? 'Hide' : 'Watch'} Trailer
                </button>
              )}
            </div>

            {/* Trailer */}
            {showTrailer && movie.trailerUrl && (
              <div className="mb-8 max-w-2xl rounded-xl overflow-hidden aspect-video border border-white/10">
                <iframe src={movie.trailerUrl} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen title="Trailer" />
              </div>
            )}

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-3">Cast</h3>
                <div className="flex gap-4 overflow-x-auto carousel-container pb-2">
                  {movie.cast.map((person, i) => (
                    <div key={i} className="flex-shrink-0 w-20 text-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 bg-navy-800 border border-white/10">
                        {person.profilePath ? (
                          <img src={person.profilePath} alt={person.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">{person.name?.charAt(0)}</div>
                        )}
                      </div>
                      <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{person.name}</p>
                      <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Movies */}
        {similar.length > 0 && (
          <div className="mt-16">
            <Carousel title="More Like This" movies={similar} />
          </div>
        )}
      </div>
    </div>
  );
}
