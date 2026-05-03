import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Moon, Sun, Download, Image as ImageIcon, UserCircle, Heart } from 'lucide-react';
import { fetchWallpapers, fetchCuratedWallpapers } from './services/pexels';
import AuthModal from './components/AuthModal';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const CATEGORY_TAGS = ['Nature', 'Cyberpunk', 'Minimalist', 'AMOLED', 'Architecture', 'Space', 'Abstract'];

// Pexels supported colors
const COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Turquoise', hex: '#06b6d4' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#000000' }
];

function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [query, setQuery] = useState('');
  const [orientation, setOrientation] = useState(''); // '' (all), 'landscape' (desktop), 'portrait' (mobile)
  const [selectedColor, setSelectedColor] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const observerTarget = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const loadWallpapers = useCallback(async (isNewSearch = false) => {
    if (loading) return;
    setLoading(true);
    
    try {
      const currentPage = isNewSearch ? 1 : page;
      let data;
      
      if (query || selectedColor || orientation) {
        // If there's any filter, use the search endpoint
        const searchTerm = query || 'aesthetic';
        data = await fetchWallpapers(searchTerm, currentPage, 30, orientation, selectedColor);
      } else {
        data = await fetchCuratedWallpapers(currentPage, 30);
      }

      if (data && data.photos) {
        setWallpapers(prev => (isNewSearch ? data.photos : [...prev, ...data.photos]));
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error("Error loading wallpapers:", error);
      toast.error('Failed to load wallpapers.');
    } finally {
      setLoading(false);
    }
  }, [query, orientation, selectedColor, page, loading]);

  // Trigger search when filters change
  useEffect(() => {
    loadWallpapers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, orientation, selectedColor]);

  // Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading && wallpapers.length > 0) {
          loadWallpapers();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadWallpapers, loading, wallpapers.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    const form = e.target;
    const searchInput = form.elements.search.value;
    setQuery(searchInput);
    window.scrollTo({ top: document.querySelector('.main-content').offsetTop - 80, behavior: 'smooth' });
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    window.scrollTo({ top: document.querySelector('.main-content').offsetTop - 80, behavior: 'smooth' });
  };

  const handleColorClick = (colorName) => {
    setSelectedColor(prevColor => prevColor === colorName ? '' : colorName);
    window.scrollTo({ top: document.querySelector('.main-content').offsetTop - 80, behavior: 'smooth' });
  };

  const downloadImage = async (url, filename) => {
    const loadingToast = toast.loading('Starting download...');
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename || 'wallpaper.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
      toast.success('Download complete!', { id: loadingToast });
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error('Download failed, opening in new tab.', { id: loadingToast });
      window.open(url, '_blank');
    }
  };

  const saveToFavorites = (e) => {
    e.stopPropagation();
    toast.success('Saved to favorites!');
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="app-container">
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        }
      }} />

      <nav className="navbar glass">
        <div className="nav-brand" onClick={() => {setQuery(''); setOrientation(''); setSelectedColor(''); window.scrollTo(0,0)}} style={{cursor: 'pointer'}}>
          <ImageIcon size={28} color="var(--accent-color)" />
          <span>Lumina</span>
        </div>
        
        <div className="nav-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAuthModalOpen(true)} 
            className="theme-toggle" 
            aria-label="Sign In" 
            style={{ width: 'auto', padding: '0 1rem', borderRadius: '999px', gap: '0.5rem' }}
          >
            <UserCircle size={20} />
            <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>Sign In</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme} 
            className="theme-toggle" 
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-content"
        >
          <h1>Discover Stunning Wallpapers</h1>
          <p>Elevate your screens with high-resolution imagery curated from the world's best creators.</p>
          
          <form onSubmit={handleSearch} className="hero-search">
            <Search size={22} color="var(--text-secondary)" />
            <input 
              type="text" 
              name="search" 
              placeholder="Search for 'Cyberpunk', 'Nature', etc..." 
              defaultValue={query}
            />
            <button type="submit" className="hero-search-btn">Search</button>
          </form>

          {/* Color Palette */}
          <div className="color-palette">
            <span className="palette-label">Filter by Color:</span>
            <div className="color-dots">
              {COLORS.map(c => (
                <motion.button
                  key={c.name}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`color-dot ${selectedColor.toLowerCase() === c.name.toLowerCase() ? 'active' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => handleColorClick(c.name)}
                  title={c.name}
                  aria-label={`Filter by ${c.name}`}
                />
              ))}
            </div>
          </div>

          <div className="category-chips" style={{marginTop: '1.5rem'}}>
            {CATEGORY_TAGS.map(tag => (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={tag} 
                className={`chip ${query.toLowerCase() === tag.toLowerCase() ? 'active' : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        <div className="filter-bar">
          <button className={`filter-btn ${orientation === '' ? 'active' : ''}`} onClick={() => setOrientation('')}>
            All Wallpapers
          </button>
          <button className={`filter-btn ${orientation === 'landscape' ? 'active' : ''}`} onClick={() => setOrientation('landscape')}>
            Desktop
          </button>
          <button className={`filter-btn ${orientation === 'portrait' ? 'active' : ''}`} onClick={() => setOrientation('portrait')}>
            Mobile
          </button>
        </div>

        {/* Wallpaper Grid */}
        <motion.div 
          className="wallpaper-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {wallpapers.map((photo, index) => (
              <motion.div 
                key={`${photo.id}-${index}`} 
                className="wallpaper-card"
                variants={itemVariants}
                layout
              >
                <img 
                  src={photo.src.large2x} 
                  alt={photo.alt || 'Wallpaper'} 
                  className="wallpaper-image"
                  loading="lazy"
                />
                <div className="wallpaper-overlay">
                  <div className="overlay-top">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="heart-btn" 
                      onClick={saveToFavorites} 
                      aria-label="Save to favorites"
                    >
                      <Heart size={20} />
                    </motion.button>
                  </div>
                  <div className="overlay-bottom">
                    <div className="info-group">
                      <span className="author-info">Photo by {photo.photographer}</span>
                      <span className="resolution-info">{photo.width} × {photo.height}</span>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="download-btn" 
                      onClick={() => downloadImage(photo.src.original, `lumina-${photo.id}.jpg`)}
                    >
                      <Download size={16} />
                      Download
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="wallpaper-card skeleton-card"></div>
          ))}
        </motion.div>

        {!loading && wallpapers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="no-results"
          >
            <p>No wallpapers found. Try a different search term or color.</p>
          </motion.div>
        )}

        <div ref={observerTarget} style={{ height: '20px', margin: '2rem 0' }}></div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <ImageIcon size={24} color="var(--accent-color)" />
            <span>Lumina</span>
          </div>
          <div className="footer-links">
            <a href="#">About Us</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
          <div className="footer-credit">
            Powered by the <a href="https://www.pexels.com" target="_blank" rel="noreferrer">Pexels API</a>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default App;
