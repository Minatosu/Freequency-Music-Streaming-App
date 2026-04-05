import { useState, useLayoutEffect, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Search from './pages/Search';
import Playlists from './pages/Playlists';
import Header from './components/Header';
import MusicPlayer from './components/MusicPlayer';
import ThemeToggle from './components/ThemeToggle';

const THEME_STORAGE_KEY = 'freequency-theme';

function readStoredDark(): boolean {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
  } catch {
    return false;
  }
}

type Page = 'home' | 'search' | 'playlists';

type AppContentProps = {
  isDark: boolean;
  onToggleDarkMode: () => void;
};

function AppContent({ isDark, onToggleDarkMode }: AppContentProps) {
  const { user, loading } = useApp();
  const [showLogin, setShowLogin] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectPlaylistId, setSelectPlaylistId] = useState<string | null>(null);
  const clearPlaylistFocus = useCallback(() => setSelectPlaylistId(null), []);

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#F6F7F9] text-gray-900 dark:bg-zinc-950 dark:text-white">
        <ThemeToggle
          isDark={isDark}
          onToggle={onToggleDarkMode}
          bordered
          className="absolute left-4 top-4 z-50"
        />
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#4A90E2]"></div>
          <p className="text-gray-600 dark:text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative">
        <ThemeToggle
          isDark={isDark}
          onToggle={onToggleDarkMode}
          bordered
          className="absolute left-4 top-4 z-50"
        />
        {showLogin ? (
          <Login onToggleAuth={() => setShowLogin(false)} />
        ) : (
          <Signup onToggleAuth={() => setShowLogin(true)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-gray-900 dark:bg-zinc-950 dark:text-zinc-100 dark:[background-image:radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(74,144,226,0.14),transparent_55%)]">
      <Header
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === 'playlists') setSelectPlaylistId(null);
          setCurrentPage(page);
        }}
        isDark={isDark}
        onToggleDarkMode={onToggleDarkMode}
      />
      <main className="mx-auto max-w-screen-xl px-4 py-8">
        {currentPage === 'home' && (
          <Home
            onGoToSearch={() => setCurrentPage('search')}
            onGoToPlaylists={(playlistId) => {
              setCurrentPage('playlists');
              setSelectPlaylistId(playlistId ?? null);
            }}
          />
        )}
        {currentPage === 'search' && <Search />}
        {currentPage === 'playlists' && (
          <Playlists selectPlaylistId={selectPlaylistId} onSelectPlaylistConsumed={clearPlaylistFocus} />
        )}
      </main>
      <MusicPlayer />
    </div>
  );
}

function App() {
  const [isDark, setIsDark] = useState(readStoredDark);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      /* ignore quota / private mode */
    }
  }, [isDark]);

  return (
    <AppProvider>
      <AppContent isDark={isDark} onToggleDarkMode={() => setIsDark((d) => !d)} />
    </AppProvider>
  );
}

export default App;
