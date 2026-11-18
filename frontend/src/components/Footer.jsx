import { Link } from 'react-router-dom';
import { Play, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-white/5 py-12 px-4 md:px-8 mt-16">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Play className="w-6 h-6 text-prime fill-prime" />
              <span className="text-xl font-black text-white">Prime<span className="text-prime">Play</span></span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">Your premium destination for movies, TV shows, and original content.</p>
            <div className="flex gap-3 mt-5">
              {[...Array(4)].map((_, i) => (
                <button key={i} className="w-8 h-8 rounded-full bg-white/10 hover:bg-prime/30 transition-colors flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Browse</h4>
            <div className="space-y-2.5">
              {[['Home', '/'], ['Movies', '/movies'], ['TV Shows', '/shows'], ['Search', '/search']].map(([label, path]) => (
                <Link key={path} to={path} className="block text-gray-500 hover:text-white text-sm transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Account</h4>
            <div className="space-y-2.5">
              {[['My Watchlist', '/watchlist'], ['Profile', '/profile'], ['Sign In', '/login'], ['Register', '/register']].map(([label, path]) => (
                <Link key={path} to={path} className="block text-gray-500 hover:text-white text-sm transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
            <div className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <span key={item} className="block text-gray-500 text-sm cursor-default">{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-sm">© 2024 PrimePlay. Built for educational purposes.</p>
          <p className="text-gray-600 text-xs">Video content provided by open-source sample files. Movie metadata © TMDB.</p>
        </div>
      </div>
    </footer>
  );
}
