import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Menu, X, Bookmark, User, LogOut, Settings, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'TV Shows', path: '/shows' },
    { label: 'Categories', path: '/movies?category=genre' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-navy-950/98 shadow-2xl shadow-black/50' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Play className="w-7 h-7 text-prime fill-prime" />
              <span className="text-xl md:text-2xl font-bold text-white">Prime<span className="text-prime">Play</span></span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${isActive(link.path) ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              {showSearch ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input ref={searchRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search movies, shows..."
                    className="bg-navy-800 border border-prime/40 text-white placeholder-gray-500 rounded-full px-4 py-1.5 text-sm w-48 md:w-64 focus:outline-none focus:border-prime transition-all"
                    autoFocus />
                  <button type="button" onClick={() => setShowSearch(false)} className="ml-2 text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button onClick={() => setShowSearch(true)} className="text-gray-300 hover:text-white p-2 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Watchlist */}
            {user && (
              <Link to="/watchlist" className="hidden md:flex text-gray-300 hover:text-white p-2 transition-colors" title="My Watchlist">
                <Bookmark className="w-5 h-5" />
              </Link>
            )}

            {/* User Menu or Auth Buttons */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-navy-800 hover:bg-navy-700 rounded-full px-3 py-1.5 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-prime flex items-center justify-center text-white font-bold text-sm">
                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" /> : user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm text-white max-w-24 truncate">{user.name}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-navy-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-white font-medium text-sm truncate">{user.name}</p>
                      <p className="text-gray-400 text-xs truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      <Link to="/watchlist" onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                        <Bookmark className="w-4 h-4" /> My Watchlist
                      </Link>
                      <button onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-300 hover:text-white px-4 py-2 transition-colors">Sign In</Link>
                <Link to="/register" className="text-sm bg-prime hover:bg-prime-dark text-white font-medium px-4 py-2 rounded-full transition-colors">Get Started</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-gray-300 hover:text-white p-2">
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-navy-900 border-t border-white/10 px-4 py-4 space-y-2 animate-fadeIn">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} onClick={() => setShowMobileMenu(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.path) ? 'bg-prime/20 text-prime' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/watchlist" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5">My Watchlist</Link>
              <Link to="/profile" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5">Profile</Link>
              <button onClick={() => { logout(); setShowMobileMenu(false); navigate('/'); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5">Sign In</Link>
              <Link to="/register" onClick={() => setShowMobileMenu(false)} className="block px-3 py-2.5 rounded-lg text-sm bg-prime text-white text-center font-medium">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
