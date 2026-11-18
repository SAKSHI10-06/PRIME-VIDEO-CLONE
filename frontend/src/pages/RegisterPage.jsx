import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Play, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const passwordChecks = {
    length: form.password.length >= 6,
    match: form.password === form.confirm && form.confirm.length > 0,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.confirm)
      return setError('Please fill in all fields.');
    if (!passwordChecks.length)
      return setError('Password must be at least 6 characters.');
    if (!passwordChecks.match)
      return setError('Passwords do not match.');

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <Play className="w-8 h-8 text-prime fill-prime" />
          <span className="text-3xl font-black text-white">Prime<span className="text-prime">Play</span></span>
        </Link>

        <div className="bg-navy-800/80 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
          <p className="text-gray-400 text-sm mb-7">Start streaming today — it's free!</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/40 text-red-300 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" name="name" placeholder="Full Name" value={form.name}
                onChange={handleChange} required
                className="w-full bg-navy-900 border border-white/10 text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-prime transition-colors" />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" name="email" placeholder="Email Address" value={form.email}
                onChange={handleChange} required
                className="w-full bg-navy-900 border border-white/10 text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-prime transition-colors" />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password (min 6 chars)" value={form.password}
                onChange={handleChange} required
                className="w-full bg-navy-900 border border-white/10 text-white placeholder-gray-500 pl-10 pr-12 py-3 rounded-xl focus:outline-none focus:border-prime transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} name="confirm" placeholder="Confirm Password" value={form.confirm}
                onChange={handleChange} required
                className="w-full bg-navy-900 border border-white/10 text-white placeholder-gray-500 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-prime transition-colors" />
            </div>

            {/* Password Checks */}
            {form.password && (
              <div className="flex flex-col gap-1 text-xs">
                <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-green-400' : 'text-gray-500'}`}>
                  <CheckCircle className="w-3.5 h-3.5" /> At least 6 characters
                </div>
                {form.confirm && (
                  <div className={`flex items-center gap-1.5 ${passwordChecks.match ? 'text-green-400' : 'text-red-400'}`}>
                    <CheckCircle className="w-3.5 h-3.5" /> Passwords match
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-prime hover:bg-prime-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-prime hover:text-prime-light font-semibold transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
