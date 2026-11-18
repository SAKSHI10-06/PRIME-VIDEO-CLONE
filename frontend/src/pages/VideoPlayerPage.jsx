import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, ChevronDown
} from 'lucide-react';
import { movieService } from '../services/movieService';
import { getLocalById } from '../data/movies';
import { useAuth } from '../context/AuthContext';

const SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`;
}

export default function VideoPlayerPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user, updateHistory, history } = useAuth();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimer = useRef(null);

  const [movie, setMovie] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buffering, setBuffering] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await movieService.getById(id, type);
        setMovie(res.data.movie);
      } catch {
        setMovie(getLocalById(id));
      }
    };
    fetch();
  }, [id, type]);

  // Resume from history
  useEffect(() => {
    if (movie && user && videoRef.current) {
      const histEntry = history.find(h => h.movieId === String(movie.tmdbId || movie._id));
      if (histEntry?.playbackPosition > 10) {
        videoRef.current.currentTime = histEntry.playbackPosition;
      }
    }
  }, [movie, user]);

  // Save history periodically
  useEffect(() => {
    if (!user || !movie) return;
    const interval = setInterval(() => {
      if (videoRef.current && currentTime > 5) {
        const movieId = movie.tmdbId || movie._id;
        const movieData = { title: movie.title, poster: movie.poster, type: movie.type, duration: movie.duration };
        updateHistory(movieId, Math.floor(currentTime), Math.floor(duration), movieData).catch(() => {});
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [user, movie, currentTime, duration]);

  const hideControlsAfter = useCallback(() => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    setShowControls(true);
    controlsTimer.current = setTimeout(() => { if (playing) setShowControls(false); }, 3500);
  }, [playing]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
    hideControlsAfter();
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const time = pct * duration;
    if (videoRef.current) videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const skip = (secs) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(Math.max(0, currentTime + secs), duration);
    }
  };

  const changeSpeed = (s) => {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
    setShowSettings(false);
  };

  const videoSrc = movie?.videoUrl || SAMPLE_VIDEO;
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={containerRef} className="w-full h-screen bg-black flex flex-col relative select-none"
      onMouseMove={hideControlsAfter} onClick={togglePlay}>

      {/* Video */}
      <video ref={videoRef} src={videoSrc} className="w-full h-full object-contain"
        onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
        onDurationChange={e => setDuration(e.target.duration)}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)} onCanPlay={() => { setBuffering(false); setLoading(false); }}
        onLoadedData={() => setLoading(false)}
        onEnded={() => { setPlaying(false); setShowControls(true); }}
      />

      {/* Buffering Spinner */}
      {(loading || buffering) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        onClick={e => e.stopPropagation()}>

        {/* Top Bar */}
        <div className="bg-gradient-to-b from-black/80 to-transparent px-4 md:px-8 pt-6 pb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            {movie && (
              <div>
                <h2 className="text-white font-bold text-lg">{movie.title}</h2>
                <p className="text-gray-400 text-sm">{type === 'show' ? 'TV Series' : 'Movie'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Center Play/Pause hint */}
        <div className="flex items-center justify-center gap-10 pointer-events-none">
          {/* invisible center for click area */}
        </div>

        {/* Bottom Controls */}
        <div className="bg-gradient-to-t from-black/90 to-transparent px-4 md:px-8 pb-8 pt-16">
          {/* Progress Bar */}
          <div className="relative h-1 bg-white/20 rounded-full cursor-pointer mb-4 group/progress hover:h-2 transition-all"
            onClick={handleSeek}>
            <div className="h-full bg-prime rounded-full relative" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={togglePlay} className="text-white hover:text-prime transition-colors p-1">
                {playing ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white" />}
              </button>
              <button onClick={() => skip(-10)} className="text-white/80 hover:text-white transition-colors hidden md:block">
                <SkipBack className="w-5 h-5" />
              </button>
              <button onClick={() => skip(10)} className="text-white/80 hover:text-white transition-colors hidden md:block">
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button onClick={() => { setMuted(!muted); if (videoRef.current) videoRef.current.muted = !muted; }}
                  className="text-white/80 hover:text-white transition-colors">
                  {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
                  onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (videoRef.current) videoRef.current.volume = v; setMuted(v === 0); }}
                  className="w-20 md:w-28 accent-prime hidden sm:block" />
              </div>

              {/* Time */}
              <span className="text-white/80 text-sm font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Speed Settings */}
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                  className="flex items-center gap-1 text-white/80 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors">
                  <Settings className="w-4 h-4" /> {speed}x
                </button>
                {showSettings && (
                  <div className="absolute bottom-10 right-0 bg-navy-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}>
                    <div className="px-4 py-2 border-b border-white/10 text-xs text-gray-400 font-semibold uppercase">Playback Speed</div>
                    {SPEEDS.map(s => (
                      <button key={s} onClick={() => changeSpeed(s)}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${speed === s ? 'text-prime bg-prime/10' : 'text-white hover:bg-white/10'}`}>
                        {s === 1 ? 'Normal' : `${s}x`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-colors">
                {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
