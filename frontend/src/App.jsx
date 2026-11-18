import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import TVShowsPage from './pages/TVShowsPage';
import MovieDetailPage from './pages/MovieDetailPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import SearchPage from './pages/SearchPage';
import WatchlistPage from './pages/WatchlistPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function Layout({ children, hideFooter = false }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/movies" element={<Layout><MoviesPage /></Layout>} />
          <Route path="/shows" element={<Layout><TVShowsPage /></Layout>} />
          <Route path="/details/:type/:id" element={<Layout><MovieDetailPage /></Layout>} />
          <Route path="/search" element={<Layout><SearchPage /></Layout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/watchlist" element={<Layout><ProtectedRoute><WatchlistPage /></ProtectedRoute></Layout>} />
          <Route path="/profile" element={<Layout><ProtectedRoute><ProfilePage /></ProtectedRoute></Layout>} />
          <Route path="/player/:type/:id" element={<VideoPlayerPage />} />
          <Route path="*" element={
            <Layout>
              <div className="min-h-screen bg-navy-950 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-8xl font-black text-prime mb-4">404</h1>
                  <p className="text-white text-2xl font-bold mb-2">Page Not Found</p>
                  <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
                  <a href="/" className="bg-prime hover:bg-prime-dark text-white font-semibold px-8 py-3 rounded-full transition-colors">Go Home</a>
                </div>
              </div>
            </Layout>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
