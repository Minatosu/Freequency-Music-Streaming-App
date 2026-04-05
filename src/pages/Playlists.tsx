import { useState, useEffect } from 'react';
import { supabase, Playlist, Song, PlaylistSong } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Play, X } from 'lucide-react';

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const { user, playSong } = useApp();

  useEffect(() => {
    if (user) {
      loadPlaylists();
      loadSongs();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPlaylist) {
      loadPlaylistSongs(selectedPlaylist.id);
    }
  }, [selectedPlaylist]);

  const loadPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const loadSongs = async () => {
    try {
      const { data, error } = await supabase.from('songs').select('*').order('title');

      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error('Error loading songs:', error);
    }
  };

  const loadPlaylistSongs = async (playlistId: string) => {
    try {
      const { data, error } = await supabase
        .from('playlist_songs')
        .select('song_id')
        .eq('playlist_id', playlistId)
        .order('position');

      if (error) throw error;

      const songIds = data.map((ps) => ps.song_id);
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .in('id', songIds);

      if (songsError) throw songsError;
      setPlaylistSongs(songsData || []);
    } catch (error) {
      console.error('Error loading playlist songs:', error);
    }
  };

  const createPlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return;

    try {
      const { error } = await supabase.from('playlists').insert([
        {
          name: newPlaylistName,
          description: newPlaylistDescription,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreateModal(false);
      loadPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      const { error } = await supabase.from('playlists').delete().eq('id', playlistId);

      if (error) throw error;

      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
        setPlaylistSongs([]);
      }
      loadPlaylists();
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const addSongToPlaylist = async (songId: string) => {
    if (!selectedPlaylist) return;

    try {
      const { error } = await supabase.from('playlist_songs').insert([
        {
          playlist_id: selectedPlaylist.id,
          song_id: songId,
          position: playlistSongs.length,
        },
      ]);

      if (error) throw error;

      loadPlaylistSongs(selectedPlaylist.id);
      setShowAddSongModal(false);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
    }
  };

  const removeSongFromPlaylist = async (songId: string) => {
    if (!selectedPlaylist) return;

    try {
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', selectedPlaylist.id)
        .eq('song_id', songId);

      if (error) throw error;

      loadPlaylistSongs(selectedPlaylist.id);
    } catch (error) {
      console.error('Error removing song from playlist:', error);
    }
  };

  const availableSongs = songs.filter(
    (song) => !playlistSongs.find((ps) => ps.id === song.id)
  );

  return (
    <div className="pb-32">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">My Playlists</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#4A90E2] text-white px-4 py-2 rounded-lg hover:bg-[#357ABD] transition"
        >
          <Plus className="w-5 h-5" />
          Create Playlist
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {playlists.length > 0 ? (
            <div className="space-y-3">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className={`bg-white p-4 rounded-lg shadow-sm cursor-pointer transition ${
                    selectedPlaylist?.id === playlist.id
                      ? 'ring-2 ring-[#4A90E2]'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPlaylist(playlist)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{playlist.name}</h3>
                      {playlist.description && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {playlist.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist(playlist.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-gray-600">No playlists yet. Create your first one!</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedPlaylist ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedPlaylist.name}</h3>
                  {selectedPlaylist.description && (
                    <p className="text-gray-600 mt-1">{selectedPlaylist.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowAddSongModal(true)}
                  className="flex items-center gap-2 bg-[#4A90E2] text-white px-4 py-2 rounded-lg hover:bg-[#357ABD] transition"
                >
                  <Plus className="w-5 h-5" />
                  Add Song
                </button>
              </div>

              {playlistSongs.length > 0 ? (
                <div className="space-y-2">
                  {playlistSongs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition group"
                    >
                      <img
                        src={song.cover_image}
                        alt={song.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{song.title}</p>
                        <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                      </div>
                      <button
                        onClick={() => playSong(song, playlistSongs)}
                        className="p-2 text-gray-400 hover:text-[#4A90E2] transition opacity-0 group-hover:opacity-100"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => removeSongFromPlaylist(song.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No songs in this playlist. Add some!
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-600">Select a playlist to view its songs</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Create Playlist</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent outline-none"
                  placeholder="My Awesome Playlist"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="A collection of my favorite songs..."
                />
              </div>
              <button
                onClick={createPlaylist}
                disabled={!newPlaylistName.trim()}
                className="w-full bg-[#4A90E2] text-white py-2 rounded-lg hover:bg-[#357ABD] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddSongModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Song to Playlist</h3>
              <button
                onClick={() => setShowAddSongModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {availableSongs.length > 0 ? (
              <div className="space-y-2">
                {availableSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => addSongToPlaylist(song.id)}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                  >
                    <img
                      src={song.cover_image}
                      alt={song.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{song.title}</p>
                      <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                    </div>
                    <Plus className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                All songs are already in this playlist
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
