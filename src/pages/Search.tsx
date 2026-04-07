import { useState, useEffect } from 'react';
import { supabase, Song } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import SongCard from '../components/SongCard';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const { playSong } = useApp();

  useEffect(() => {
    loadSongs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs([]);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query) ||
          song.album.toLowerCase().includes(query) ||
          song.genre.toLowerCase().includes(query)
      );
      setFilteredSongs(filtered);
    }
  }, [searchQuery, allSongs]);

  const loadSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      setAllSongs(data || []);
    } catch (error) {
      console.error('Error loading songs:', error);
    }
  };

  const handlePlaySong = (song: Song) => {
    playSong(song, filteredSongs.length > 0 ? filteredSongs : allSongs);
  };

  return (
    <div className="pb-32">
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">Search</h2>
        <div className="relative max-w-2xl">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search for songs, artists, albums, or genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#4A90E2] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:ring-[#4A90E2]/80"
          />
        </div>
      </div>

      {searchQuery.trim() === '' ? (
        <div>
          <h3 className="mb-4 text-lg font-bold text-zinc-900 dark:text-white md:text-xl">Browse all</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[
              { name: 'Pop', color: 'bg-pink-700 dark:bg-pink-800' },
              { name: 'Hip-Hop', color: 'bg-orange-700 dark:bg-orange-800' },
              { name: 'Rock', color: 'bg-red-700 dark:bg-red-800' },
              { name: 'Indie', color: 'bg-emerald-700 dark:bg-emerald-800' },
              { name: 'R&B', color: 'bg-purple-700 dark:bg-purple-800' },
              { name: 'Bollywood', color: 'bg-amber-700 dark:bg-amber-800' },
              { name: 'Soul', color: 'bg-blue-700 dark:bg-blue-800' },
              { name: 'Electronic', color: 'bg-cyan-700 dark:bg-cyan-800' },
              { name: 'Oldies', color: 'bg-stone-700 dark:bg-stone-800' },
              { name: 'Lo-Fi', color: 'bg-indigo-700 dark:bg-indigo-800' },
            ].map((genre) => (
              <button
                key={genre.name}
                onClick={() => setSearchQuery(genre.name)}
                className={`flex aspect-[4/3] sm:aspect-video items-center justify-center rounded-xl overflow-hidden ${genre.color} p-4 shadow-sm transition-transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1a6ff4]`}
              >
                <span className="text-lg font-bold tracking-wide text-white drop-shadow-sm">{genre.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : filteredSongs.length > 0 ? (
        <div>
          <p className="mb-6 text-gray-600 dark:text-zinc-400">
            Found {filteredSongs.length} {filteredSongs.length === 1 ? 'result' : 'results'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredSongs.map((song) => (
              <SongCard key={song.id} song={song} onPlay={() => handlePlaySong(song)} />
            ))}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-600 dark:text-zinc-400">No results found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
