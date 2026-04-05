import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Search from './pages/Search';
import Playlists from './pages/Playlists';
import Header from './components/Header';
import MusicPlayer from './components/MusicPlayer';

type Page = 'home' | 'search' | 'playlists';

function AppContent() {
  const { user, loading } = useApp();
  const [showLogin, setShowLogin] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A90E2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onToggleAuth={() => setShowLogin(false)} />
    ) : (
      <Signup onToggleAuth={() => setShowLogin(true)} />
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {currentPage === 'home' && <Home />}
        {currentPage === 'search' && <Search />}
        {currentPage === 'playlists' && <Playlists />}
      </main>
      <MusicPlayer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
