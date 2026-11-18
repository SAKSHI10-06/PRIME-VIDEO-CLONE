import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Edit3, Save, X, LogOut, Play, Trash2, Clock, Bookmark, Eye, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/movieService';

function ProgressBar({ position, duration }) {
  const pct = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;
  return (
    <div className="w-full h-1 bg-white/10 rounded-full mt-2">
      <div className="h-full bg-prime rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser, logout, watchlist, history, removeHistory } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('watchlist');

  if (!user) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="text-center">
        <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-white text-xl font-bold mb-4">Sign in to view your profile</h3>
        <Link to="/login" className="bg-prime hover:bg-prime-dark text-white font-semibold px-8 py-3 rounded-full transition-colors">Sign In</Link>
      </div>
    </div>
  );

  const handleSave = async () => {
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await userService.updateProfile(form);
      updateUser(res.data.user);
      setEditing(false);
      setMsg({ text: 'Profile updated!', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const initials = user.name?.charAt(0).toUpperCase() || 'U';
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '';

  const tabs = [
    { key: 'watchlist', label: 'Watchlist', icon: Bookmark, count: watchlist.length },
    { key: 'history', label: 'Watch History', icon: Clock, count: history.length },
  ];

  return (
    <div className="min-h-screen bg-navy-950 pt-24 pb-16">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">

        {/* Profile Header Card */}
        <div className="bg-navy-800/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-prime/40" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-prime to-prime-dark flex items-center justify-center text-white text-4xl font-black border-4 border-prime/40">
                  {initials}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3 max-w-md">
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full bg-navy-900 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-prime transition-colors" />
                  <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Short bio (optional)" rows={2} maxLength={200}
                    className="w-full bg-navy-900 border border-white/10 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-prime transition-colors resize-none" />
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-2 bg-prime hover:bg-prime-dark text-white font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-50">
                      <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => { setEditing(false); setForm({ name: user.name || '', bio: user.bio || '' }); }}
                      className="flex items-center gap-2 bg-white/10 text-white px-5 py-2 rounded-xl hover:bg-white/20 transition-colors">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl md:text-3xl font-black text-white">{user.name}</h1>
                    <button onClick={() => setEditing(true)}
                      className="text-gray-400 hover:text-prime transition-colors p-1">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Mail className="w-4 h-4" /> {user.email}
                  </div>
                  {user.bio && <p className="text-gray-300 text-sm mb-2">{user.bio}</p>}
                  {joinDate && <p className="text-gray-500 text-xs">Member since {joinDate}</p>}
                </>
              )}

              {msg.text && (
                <div className={`flex items-center gap-2 text-sm mt-3 ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{watchlist.length}</div>
                <div className="text-gray-400 text-xs">Watchlist</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-white">{history.length}</div>
                <div className="text-gray-400 text-xs">Watched</div>
              </div>
            </div>

            {/* Logout */}
            <button onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/25 px-4 py-2 rounded-xl transition-colors text-sm font-medium self-start">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.key ? 'border-prime text-prime' : 'border-transparent text-gray-400 hover:text-white'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
              {tab.count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-prime/20 text-prime' : 'bg-white/10 text-gray-300'}`}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Watchlist Tab */}
        {activeTab === 'watchlist' && (
          watchlist.length === 0 ? (
            <div className="text-center py-16">
              <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Nothing in your watchlist yet</p>
              <Link to="/movies" className="text-prime hover:underline font-semibold">Browse Movies →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {watchlist.map(item => {
                const m = item.movieData || {};
                return (
                  <div key={item.movieId} className="cursor-pointer group"
                    onClick={() => navigate(`/details/${m.type || 'movie'}/${item.movieId}`)}>
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-navy-800 relative">
                      {m.poster ? <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> :
                        <div className="w-full h-full flex items-center justify-center"><Play className="w-8 h-8 text-gray-600" /></div>}
                    </div>
                    <p className="text-white text-xs font-medium mt-2 line-clamp-1">{m.title}</p>
                    <p className="text-gray-400 text-xs">{m.releaseYear}</p>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          history.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">You haven't watched anything yet</p>
              <Link to="/" className="text-prime hover:underline font-semibold">Start Watching →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(item => {
                const m = item.movieData || {};
                const pct = item.duration > 0 ? Math.round((item.playbackPosition / item.duration) * 100) : 0;
                return (
                  <div key={item.movieId} className="flex items-center gap-4 bg-navy-800/60 border border-white/5 hover:border-white/15 rounded-xl p-3 group transition-all">
                    <div className="w-20 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/player/${m.type || 'movie'}/${item.movieId}`)}>
                      {m.poster ? <img src={m.poster} alt={m.title} className="w-full h-full object-cover" /> :
                        <div className="w-full h-full bg-navy-900 flex items-center justify-center"><Play className="w-5 h-5 text-gray-600" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm line-clamp-1">{m.title || 'Unknown'}</h4>
                      <p className="text-gray-400 text-xs mt-0.5">{m.type === 'show' ? 'TV Series' : 'Movie'} · {pct}% watched</p>
                      <ProgressBar position={item.playbackPosition} duration={item.duration} />
                      <p className="text-gray-500 text-xs mt-1">{new Date(item.lastWatched).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/player/${m.type || 'movie'}/${item.movieId}`)}
                        className="bg-prime/20 hover:bg-prime/30 text-prime p-2 rounded-lg transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeHistory(item.movieId)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

      </div>
    </div>
  );
}
