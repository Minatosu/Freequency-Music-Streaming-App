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
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Search</h2>
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for songs, artists, albums, or genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      {searchQuery.trim() === '' ? (
        <div className="text-center py-12">
          <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Start typing to search for music</p>
        </div>
      ) : filteredSongs.length > 0 ? (
        <div>
          <p className="text-gray-600 mb-6">
            Found {filteredSongs.length} {filteredSongs.length === 1 ? 'result' : 'results'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredSongs.map((song) => (
              <SongCard key={song.id} song={song} onPlay={() => handlePlaySong(song)} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No results found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
