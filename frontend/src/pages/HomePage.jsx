import { useState, useEffect } from 'react';
import HeroBanner from '../components/HeroBanner';
import Carousel from '../components/Carousel';
import { movieService } from '../services/movieService';
import { localMovies } from '../data/movies';

const SECTIONS = [
  { key: 'trending', title: 'Trending Now', fetcher: () => movieService.getTrending() },
  { key: 'popular', title: 'Popular Movies', fetcher: () => movieService.getMovies({ category: 'popular' }) },
  { key: 'topRated', title: 'Top Rated', fetcher: () => movieService.getMovies({ category: 'top_rated' }) },
  { key: 'upcoming', title: 'Latest Releases', fetcher: () => movieService.getMovies({ category: 'upcoming' }) },
  { key: 'shows', title: 'Popular TV Shows', fetcher: () => movieService.getShows({ category: 'popular' }) },
  { key: 'action', title: 'Action', fetcher: () => movieService.getByGenre('action') },
  { key: 'comedy', title: 'Comedy', fetcher: () => movieService.getByGenre('comedy') },
  { key: 'scifi', title: 'Science Fiction', fetcher: () => movieService.getByGenre('science fiction') },
  { key: 'thriller', title: 'Thriller', fetcher: () => movieService.getByGenre('thriller') },
  { key: 'romance', title: 'Romance', fetcher: () => movieService.getByGenre('romance') },
  { key: 'indian', title: 'Indian Cinema', fetcher: () => movieService.getByGenre('drama') },
];

export default function HomePage() {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState({});
  const [heroMovies, setHeroMovies] = useState([]);

  useEffect(() => {
    // Load trending first for hero
    const loadTrending = async () => {
      setLoading(prev => ({ ...prev, trending: true }));
      try {
        const res = await movieService.getTrending();
        const movies = res.data.results || [];
        setSections(prev => ({ ...prev, trending: movies }));
        setHeroMovies(movies.slice(0, 8).filter(m => m.backdrop));
      } catch {
        const fallback = [...localMovies].sort((a, b) => b.popularity - a.popularity);
        setSections(prev => ({ ...prev, trending: fallback }));
        setHeroMovies(fallback.slice(0, 6).filter(m => m.backdrop));
      } finally {
        setLoading(prev => ({ ...prev, trending: false }));
      }
    };
    loadTrending();

    // Load remaining sections
    SECTIONS.slice(1).forEach(async (section) => {
      setLoading(prev => ({ ...prev, [section.key]: true }));
      try {
        const res = await section.fetcher();
        setSections(prev => ({ ...prev, [section.key]: res.data.results || [] }));
      } catch {
        setSections(prev => ({ ...prev, [section.key]: [] }));
      } finally {
        setLoading(prev => ({ ...prev, [section.key]: false }));
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-navy-950">
      <HeroBanner movies={heroMovies} />

      <div className="relative z-10 -mt-16 pb-16">
        {SECTIONS.map(section => (
          <Carousel
            key={section.key}
            title={section.title}
            movies={sections[section.key] || []}
            loading={loading[section.key]}
          />
        ))}
      </div>
    </div>
  );
}
