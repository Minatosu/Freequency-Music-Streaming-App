import { supabase, Song } from './supabase';

/** Loads songs for a playlist in playlist order. */
export async function fetchSongsForPlaylist(playlistId: string): Promise<Song[]> {
  const { data, error } = await supabase
    .from('playlist_songs')
    .select('song_id')
    .eq('playlist_id', playlistId)
    .order('position');

  if (error) throw error;
  const songIds = (data || []).map((row) => row.song_id);
  if (songIds.length === 0) return [];

  const { data: songsData, error: songsError } = await supabase.from('songs').select('*').in('id', songIds);

  if (songsError) throw songsError;
  const byId = new Map((songsData || []).map((s) => [s.id, s]));
  return songIds.map((id) => byId.get(id)).filter((s): s is Song => Boolean(s));
}
