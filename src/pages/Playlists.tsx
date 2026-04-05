import { useState, useEffect } from 'react';
import { supabase, Playlist, Song } from '../lib/supabase';
import { fetchSongsForPlaylist } from '../lib/playlistQueries';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Play, X } from 'lucide-react';

type PlaylistsProps = {
  /** When set (e.g. from Home), select this playlist once lists are loaded */
  selectPlaylistId?: string | null;
  onSelectPlaylistConsumed?: () => void;
};

export default function Playlists({ selectPlaylistId, onSelectPlaylistConsumed }: PlaylistsProps = {}) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistsReady, setPlaylistsReady] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [addSongError, setAddSongError] = useState<string | null>(null);
  const [savingPlaylist, setSavingPlaylist] = useState(false);
  const { user, playSong } = useApp();

  const formatDbError = (err: unknown): string => {
    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string') {
      return (err as { message: string }).message;
    }
    return 'Something went wrong. Check the browser console.';
  };

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

  useEffect(() => {
    if (!selectPlaylistId || !playlistsReady) return;
    const match = playlists.find((p) => p.id === selectPlaylistId);
    if (match) {
      setSelectedPlaylist(match);
    }
    onSelectPlaylistConsumed?.();
  }, [selectPlaylistId, playlists, playlistsReady, onSelectPlaylistConsumed]);

  const loadPlaylists = async () => {
    setPlaylistsReady(false);
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setPlaylistsReady(true);
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
      const list = await fetchSongsForPlaylist(playlistId);
      setPlaylistSongs(list);
    } catch (error) {
      console.error('Error loading playlist songs:', error);
    }
  };

  const createPlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return;

    setCreateError(null);
    setSavingPlaylist(true);
    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert([
          {
            name: newPlaylistName.trim(),
            description: (newPlaylistDescription || '').trim(),
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreateModal(false);
      await loadPlaylists();
      if (data) {
        setSelectedPlaylist(data);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      setCreateError(formatDbError(error));
    } finally {
      setSavingPlaylist(false);
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

    setAddSongError(null);
    try {
      const { error } = await supabase.from('playlist_songs').insert([
        {
          playlist_id: selectedPlaylist.id,
          song_id: songId,
          position: playlistSongs.length,
        },
      ]);

      if (error) throw error;

      await loadPlaylistSongs(selectedPlaylist.id);
      setShowAddSongModal(false);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      const msg = formatDbError(error);
      setAddSongError(
        msg.includes('duplicate') || msg.includes('unique') ? 'That song is already in this playlist.' : msg
      );
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
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-500">
            Your library
          </p>
          <h2 className="text-[1.35rem] font-bold tracking-tight text-zinc-900 dark:text-white md:text-2xl">
            Playlists
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex shrink-0 items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          New
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {playlists.length > 0 ? (
            <div className="space-y-3">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className={`cursor-pointer rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm transition dark:border-zinc-700/60 dark:bg-zinc-900 ${
                    selectedPlaylist?.id === playlist.id
                      ? 'ring-2 ring-[#4A90E2] dark:ring-[#4A90E2]/90'
                      : 'hover:shadow-md dark:hover:border-zinc-600'
                  }`}
                  onClick={() => setSelectedPlaylist(playlist)}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900 dark:text-zinc-50">{playlist.name}</h3>
                      {playlist.description && (
                        <p className="mt-1 truncate text-sm text-gray-600 dark:text-zinc-400">
                          {playlist.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist(playlist.id);
                      }}
                      className="p-2 text-gray-400 transition hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200/80 bg-white p-8 text-center shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900">
              <p className="text-gray-600 dark:text-zinc-400">No playlists yet. Create your first one!</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedPlaylist ? (
            <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-900">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlaylist.name}</h3>
                  {selectedPlaylist.description && (
                    <p className="mt-1 text-gray-600 dark:text-zinc-400">{selectedPlaylist.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {playlistSongs.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => playSong(playlistSongs[0], playlistSongs)}
                      className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                    >
                      <Play className="h-4 w-4" fill="currentColor" />
                      Play
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setAddSongError(null);
                      setShowAddSongModal(true);
                    }}
                    className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.25} />
                    Add songs
                  </button>
                </div>
              </div>

              {playlistSongs.length > 0 ? (
                <div className="space-y-2">
                  {playlistSongs.map((song) => (
                    <div
                      key={song.id}
                      className="group flex items-center gap-4 rounded-lg p-3 transition hover:bg-gray-50 dark:hover:bg-zinc-800/80"
                    >
                      <img
                        src={song.cover_image}
                        alt={song.title}
                        className="h-12 w-12 rounded-md object-cover ring-1 ring-black/5 dark:ring-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900 dark:text-zinc-50">{song.title}</p>
                        <p className="truncate text-sm text-gray-600 dark:text-zinc-400">{song.artist}</p>
                      </div>
                      <button
                        onClick={() => playSong(song, playlistSongs)}
                        className="p-2 text-gray-400 opacity-0 transition hover:text-[#4A90E2] group-hover:opacity-100 dark:text-zinc-500 dark:hover:text-[#6BA8E8]"
                      >
                        <Play className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => removeSongFromPlaylist(song.id)}
                        className="p-2 text-gray-400 opacity-0 transition hover:text-red-500 group-hover:opacity-100 dark:text-zinc-500 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-gray-600 dark:text-zinc-400">
                  No songs in this playlist. Add some!
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900/50">
              <p className="text-gray-600 dark:text-zinc-400">Select a playlist to view its songs</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70">
          <div className="w-full max-w-md rounded-xl border border-gray-200/80 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Playlist</h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError(null);
                }}
                className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-zinc-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">Name</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#4A90E2] dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                  placeholder="My Awesome Playlist"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Description (optional)
                </label>
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#4A90E2] dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                  rows={3}
                  placeholder="A collection of my favorite songs..."
                />
              </div>
              {createError ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  {createError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={createPlaylist}
                disabled={!newPlaylistName.trim() || savingPlaylist}
                className="w-full rounded-lg bg-[#4A90E2] py-2 text-white transition hover:bg-[#357ABD] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingPlaylist ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddSongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-200/80 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Song to Playlist</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddSongModal(false);
                  setAddSongError(null);
                }}
                className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-zinc-400" />
              </button>
            </div>
            {addSongError ? (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {addSongError}
              </p>
            ) : null}
            {availableSongs.length > 0 ? (
              <div className="space-y-2">
                {availableSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => addSongToPlaylist(song.id)}
                    className="flex cursor-pointer items-center gap-4 rounded-lg p-3 transition hover:bg-gray-50 dark:hover:bg-zinc-800/80"
                  >
                    <img
                      src={song.cover_image}
                      alt={song.title}
                      className="h-12 w-12 rounded-md object-cover ring-1 ring-black/5 dark:ring-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900 dark:text-zinc-50">{song.title}</p>
                      <p className="truncate text-sm text-gray-600 dark:text-zinc-400">{song.artist}</p>
                    </div>
                    <Plus className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-600 dark:text-zinc-400">
                All songs are already in this playlist
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
