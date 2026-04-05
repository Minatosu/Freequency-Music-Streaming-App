import { useApp } from '../context/AppContext';
import { Music, Search, Home, List, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  currentPage: 'home' | 'search' | 'playlists';
  onNavigate: (page: 'home' | 'search' | 'playlists') => void;
  isDark: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({ currentPage, onNavigate, isDark, onToggleDarkMode }: HeaderProps) {
  const { user, signOut } = useApp();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-8 h-8 text-[#4A90E2]" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Freequency</h1>
          </div>

          <nav className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentPage === 'home'
                  ? 'bg-[#4A90E2] text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden md:inline">Home</span>
            </button>

            <button
              onClick={() => onNavigate('search')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentPage === 'search'
                  ? 'bg-[#4A90E2] text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="hidden md:inline">Search</span>
            </button>

            <button
              onClick={() => onNavigate('playlists')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentPage === 'playlists'
                  ? 'bg-[#4A90E2] text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              <List className="w-5 h-5" />
              <span className="hidden md:inline">Playlists</span>
            </button>

            {user && (
              <>
                <span
                  className="hidden h-8 w-px shrink-0 bg-gray-200 dark:bg-zinc-700 sm:block"
                  aria-hidden
                />
                <ThemeToggle isDark={isDark} onToggle={onToggleDarkMode} />
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 transition hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
