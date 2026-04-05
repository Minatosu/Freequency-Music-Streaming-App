import { useApp } from '../context/AppContext';
import { Music, Search, Home, List, LogOut } from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'search' | 'playlists';
  onNavigate: (page: 'home' | 'search' | 'playlists') => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { user, signOut } = useApp();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-8 h-8 text-[#4A90E2]" />
            <h1 className="text-2xl font-bold text-gray-900">Freequency</h1>
          </div>

          <nav className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentPage === 'home'
                  ? 'bg-[#4A90E2] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
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
                  : 'text-gray-700 hover:bg-gray-100'
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
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
              <span className="hidden md:inline">Playlists</span>
            </button>

            {user && (
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
