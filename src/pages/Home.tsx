import { useEffect, useState } from 'react';
import { supabase, Song } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import SongCard from '../components/SongCard';

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = useApp();

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song: Song) => {
    playSong(song, songs);
  };

  const trendingSongs = songs.slice(0, 4);
  const newReleases = songs.slice(0, 4);
  const popSongs = songs.filter((s) => s.genre === 'Pop');
  const soulSongs = songs.filter((s) => s.genre === 'Soul');
  const hipHopSongs = songs.filter((s) => s.genre === 'Hip-Hop');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A90E2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Trending Now</h2>
        {trendingSongs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingSongs.map((song) => (
              <SongCard key={song.id} song={song} onPlay={() => handlePlaySong(song)} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No trending songs available</p>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">New Releases</h2>
        {newReleases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newReleases.map((song) => (
              <SongCard key={song.id} song={song} onPlay={() => handlePlaySong(song)} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No new releases available</p>
        )}
      </section>

      {popSongs.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Pop</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popSongs.map((song) => (
              <SongCard key={song.id} song={song} onPlay={() => handlePlaySong(song)} />
            ))}
          </div>
        </section>
      )}

      {soulSongs.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Soul</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {soulSongs.map((song) => (
              <SongCard key={song.id} song={song} onPlay={() => handlePlaySong(song)} />
            ))}
          </div>
        </section>
      )}

      {hipHopSongs.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Hip-Hop</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hipHopSongs.map((song) => (
              <SongCard key={song.id} song={song} onPlay={() => handlePlaySong(song)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
