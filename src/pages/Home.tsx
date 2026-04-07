import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronRight, ListMusic, Play } from 'lucide-react';
import { supabase, Song, Playlist } from '../lib/supabase';
import { fetchSongsForPlaylist } from '../lib/playlistQueries';
import { useApp } from '../context/AppContext';
import SongCard from '../components/SongCard';

function playCount(s: Song): number {
  return typeof s.play_count === 'number' && !Number.isNaN(s.play_count) ? s.play_count : 0;
}

/** Newest first, then stable id */
function compareByDateDesc(a: Song, b: Song): number {
  const ta = new Date(a.created_at).getTime();
  const tb = new Date(b.created_at).getTime();
  if (tb !== ta) return tb - ta;
  return a.id.localeCompare(b.id);
}

/** Oldest first (for a different row than “newest” trending ties) */
function compareByDateAsc(a: Song, b: Song): number {
  return compareByDateDesc(b, a);
}

/** Trending: plays first; ties → newest; then id (never identical order to “new only” date sort) */
function compareTrending(a: Song, b: Song): number {
  const pc = playCount(b) - playCount(a);
  if (pc !== 0) return pc;
  return compareByDateDesc(a, b);
}

function uniqById(songs: Song[]): Song[] {
  const seen = new Set<string>();
  return songs.filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));
}

type FeedBuckets = {
  trending: Song[];
  newReleases: Song[];
  suggested: Song[];
  genreSections: { genre: string; items: Song[] }[];
};

const ROW_LIMIT = 14;

function computeHomeFeed(songs: Song[], currentSong: Song | null): FeedBuckets {
  const list = uniqById(songs);
  if (list.length === 0) {
    return { trending: [], newReleases: [], suggested: [], genreSections: [] };
  }

  const n = list.length;
  /** ~⅓ of the library per row so rows stay different when n is large enough */
  const chunk = Math.min(ROW_LIMIT, Math.max(1, Math.floor(n / 3)));

  const trending = [...list].sort(compareTrending).slice(0, chunk);
  const trendingIds = new Set(trending.map((s) => s.id));

  let newReleases = [...list].sort(compareByDateDesc).filter((s) => !trendingIds.has(s.id)).slice(0, chunk);

  if (newReleases.length === 0) {
    newReleases = [...list].sort(compareByDateAsc).filter((s) => !trendingIds.has(s.id)).slice(0, chunk);
  }
  if (newReleases.length === 0) {
    newReleases = [...list].sort(compareByDateAsc).slice(0, Math.min(chunk, n));
  }

  const usedForSuggest = new Set<string>([...trendingIds, ...newReleases.map((s) => s.id)]);
  let pool = list.filter((s) => !usedForSuggest.has(s.id));

  let suggested: Song[] = [];
  if (pool.length > 0) {
    if (currentSong) {
      const sameGenre = pool.filter((s) => s.genre === currentSong.genre && s.id !== currentSong.id);
      const other = pool.filter((s) => s.genre !== currentSong.genre || s.id === currentSong.id);
      suggested = uniqById([...sameGenre, ...other]).slice(0, ROW_LIMIT);
    } else {
      suggested = [...pool]
        .sort((a, b) => {
          const ha = (a.id.charCodeAt(0) + a.title.length) % 7;
          const hb = (b.id.charCodeAt(0) + b.title.length) % 7;
          if (ha !== hb) return ha - hb;
          return `${a.artist}\0${a.title}`.localeCompare(`${b.artist}\0${b.title}`, undefined, { sensitivity: 'base' });
        })
        .slice(0, ROW_LIMIT);
    }
  }

  if (suggested.length === 0) {
    const avoid = usedForSuggest;
    suggested = [...list]
      .filter((s) => !avoid.has(s.id))
      .sort((a, b) =>
        `${a.album}\0${a.title}`.localeCompare(`${b.album}\0${b.title}`, undefined, { sensitivity: 'base' })
      )
      .slice(0, ROW_LIMIT);
  }
  if (suggested.length === 0) {
    suggested = [...list]
      .sort((a, b) =>
        `${a.artist}\0${a.title}`.localeCompare(`${b.artist}\0${b.title}`, undefined, { sensitivity: 'base' })
      )
      .slice(0, ROW_LIMIT);
  }

  const suggestedIds = new Set(suggested.map((s) => s.id));
  const featuredIds = new Set<string>([...trendingIds, ...newReleases.map((s) => s.id), ...suggestedIds]);

  const genres = topGenres(list, 3);
  const genreSections = genres
    .map((genre) => {
      const inGenre = list.filter((s) => s.genre === genre);
      const fresh = inGenre.filter((s) => !featuredIds.has(s.id));
      const items = (fresh.length >= 4 ? fresh : inGenre).slice(0, 12);
      return { genre, items };
    })
    .filter((g) => g.items.length > 0);

  return { trending, newReleases, suggested, genreSections };
}

function topGenres(songs: Song[], limit: number): string[] {
  const tally = new Map<string, number>();
  for (const s of songs) {
    const g = s.genre?.trim() || 'Other';
    tally.set(g, (tally.get(g) || 0) + 1);
  }
  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([g]) => g);
}

function FeedRow({
  eyebrow,
  title,
  children,
  actionLabel,
  onAction,
}: {
  /** Small caps label above the title (Spotify / YT Music style) */
  eyebrow?: string;
  title: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <section className="mb-9 md:mb-11">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-500">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="truncate text-[1.35rem] font-bold leading-tight tracking-tight text-zinc-900 dark:text-white md:text-2xl">
            {title}
          </h2>
        </div>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="group flex shrink-0 items-center gap-0.5 pb-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            {actionLabel}
            <ChevronRight
              className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.25}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
        {children}
      </div>
    </section>
  );
}

function PlaylistFeedCard({
  playlist,
  onPlay,
  onOpenInLibrary,
}: {
  playlist: Playlist;
  onPlay: () => void;
  onOpenInLibrary: () => void;
}) {
  return (
    <div className="flex w-[140px] shrink-0 snap-start flex-col gap-2 sm:w-[152px]">
      <button
        type="button"
        onClick={onPlay}
        className="group relative flex aspect-square w-full flex-col overflow-hidden rounded-md bg-gradient-to-br from-[#3d7dcc] to-[#5c4ddb] p-3 text-left shadow-sm ring-1 ring-black/[0.08] transition hover:shadow-md dark:ring-white/[0.1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2] focus-visible:ring-offset-2 dark:ring-offset-zinc-950"
      >
        <span className="absolute right-2 top-2 rounded-full bg-black/20 p-1.5 opacity-0 transition group-hover:opacity-100">
          <Play className="h-4 w-4 text-white" fill="white" />
        </span>
        <ListMusic className="mb-auto h-6 w-6 text-white/85" strokeWidth={1.75} />
        <span className="line-clamp-2 text-left text-[13px] font-semibold leading-snug text-white">{playlist.name}</span>
      </button>
      <button
        type="button"
        onClick={onOpenInLibrary}
        className="text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        Open
      </button>
    </div>
  );
}

const COMPACT_CARD = 'w-[118px] shrink-0 snap-start sm:w-[128px]';

type HomeProps = {
  onGoToPlaylists?: (playlistId?: string) => void;
  onGoToSearch?: () => void;
};

export default function Home({ onGoToPlaylists, onGoToSearch }: HomeProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState('All');
  const GENRES = ['All', 'Pop', 'Hip-Hop', 'Rock', 'Indie', 'R&B', 'Bollywood'];
  const { playSong, user, currentSong } = useApp();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (songsError) throw songsError;
      setSongs(songsData || []);

      if (user) {
        const { data: plData, error: plError } = await supabase
          .from('playlists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (plError) throw plError;
        setPlaylists(plData || []);
      } else {
        setPlaylists([]);
      }
    } catch (error) {
      console.error('Error loading home feed:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredSongs = useMemo(() => {
    return activeGenre === 'All' ? songs : songs.filter(s => s.genre?.trim().toLowerCase() === activeGenre.toLowerCase());
  }, [songs, activeGenre]);

  const { trending: trendingSongs, newReleases, suggested: suggestedSongs, genreSections } = useMemo(
    () => computeHomeFeed(filteredSongs, currentSong),
    [filteredSongs, currentSong]
  );

  const handlePlaySong = (song: Song, queue: Song[]) => {
    playSong(song, queue.length ? queue : songs);
  };

  const handlePlayPlaylist = async (playlistId: string) => {
    try {
      const list = await fetchSongsForPlaylist(playlistId);
      if (list.length === 0) {
        window.alert('This playlist is empty. Add songs from your library.');
        return;
      }
      playSong(list[0], list);
    } catch (e) {
      console.error(e);
      window.alert('Could not load that playlist.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#4A90E2]"></div>
          <p className="text-gray-600 dark:text-zinc-400">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <div className="mb-8 pt-2">
        <div className="flex items-center justify-between mb-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#1a6ff4]">
            What's hot right now
          </p>
          {onGoToSearch && (
            <button
              onClick={onGoToSearch}
              className="group flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              See all trending
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

        <div className="relative flex justify-center items-center h-[17rem] md:h-72 mb-10 w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(26,111,244,0.15)] ring-1 ring-black/5 dark:ring-white/5">
          {/* Concert / Artist Vibe Background */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1540039155732-d688147d3419?auto=format&fit=crop&w=1200&q=80" 
              alt="Live Concert" 
              className="w-full h-full object-cover opacity-80"
            />
            {/* Blurs and gradients to make cards pop */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/90 via-[#1a3a6e]/70 to-[#0f172a]/90 backdrop-blur-sm"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 dark:from-zinc-950/80 via-transparent to-transparent"></div>
          </div>
          
          {/* Deck of Cards */}
          <div className="relative z-10 w-full h-full flex justify-center items-center group/deck">
            {trendingSongs.slice(0, 5).map((song, idx) => {
              const positionClasses = 
                idx === 0 ? 'z-50 scale-105 md:scale-[1.12] -translate-y-2' :
                idx === 1 ? 'z-40 -translate-x-[80%] md:-translate-x-[110%] -rotate-[5deg] scale-[0.98] opacity-95 translate-y-2' :
                idx === 2 ? 'z-30 translate-x-[80%] md:translate-x-[110%] rotate-[5deg] scale-[0.98] opacity-95 translate-y-2' :
                idx === 3 ? 'z-20 opacity-0 sm:opacity-85 pointer-events-none sm:pointer-events-auto -translate-x-[160%] md:-translate-x-[215%] -rotate-[10deg] scale-90 translate-y-6' :
                'z-10 opacity-0 sm:opacity-85 pointer-events-none sm:pointer-events-auto translate-x-[160%] md:translate-x-[215%] rotate-[10deg] scale-90 translate-y-6';
              
              return (
                <div 
                  key={song.id}
                  onClick={() => handlePlaySong(song, trendingSongs)}
                  className={`absolute flex flex-col items-center group/card transition-all duration-500 ease-out hover:cursor-pointer hover:!z-[60] hover:!scale-125 hover:!-translate-y-4 ${positionClasses}`}
                >
                  <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-[13.5rem] md:h-[13.5rem] rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden ring-2 ring-white/20 dark:ring-white/10 group-hover/card:ring-[#1a6ff4]/50 transition-colors">
                    <img 
                      src={song.cover_image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80'} 
                      alt={song.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" 
                    />
                  </div>
                  {/* Text below the card edge */}
                  <div className="mt-3 text-center px-1">
                    <p className="text-[13px] md:text-sm font-bold text-white drop-shadow-md truncate max-w-[140px] md:max-w-[180px] leading-tight">
                      {song.title}
                    </p>
                    <p className="text-[10px] md:text-[11px] text-[#1a6ff4] truncate font-extrabold uppercase tracking-[0.08em] mt-1 drop-shadow flex justify-center max-w-[140px] md:max-w-[180px]">
                      {song.artist}
                    </p>
                  </div>
                </div>
              );
            })}
            {trendingSongs.length === 0 && (
              <div className="text-white/60">No trending songs available.</div>
            )}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 [scrollbar-width:none]">
          {GENRES.map(g => (
            <button 
              key={g} 
              onClick={() => setActiveGenre(g)}
              className={`shrink-0 px-5 py-2 mt-2 rounded-full text-sm font-semibold transition-colors border shadow-sm ${
                 activeGenre === g 
                 ? 'bg-[#1a6ff4] text-white border-[#1a6ff4]'
                 : 'border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800'
              }`}
            >
               {g}
            </button>
          ))}
        </div>
      </div>

      {user && (
        <FeedRow
          eyebrow="Your library"
          title="Playlists"
          actionLabel={playlists.length ? 'Show all' : 'Create'}
          onAction={() => onGoToPlaylists?.()}
        >
          {playlists.length === 0 ? (
            <div className="flex min-h-[112px] min-w-[min(100%,260px)] snap-start flex-col justify-center rounded-md border border-dashed border-zinc-200/90 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/30">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">No playlists yet.</p>
              <button
                type="button"
                onClick={() => onGoToPlaylists?.()}
                className="mt-2 w-fit text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Create playlist
              </button>
            </div>
          ) : (
            playlists.map((pl) => (
              <PlaylistFeedCard
                key={pl.id}
                playlist={pl}
                onPlay={() => handlePlayPlaylist(pl.id)}
                onOpenInLibrary={() => onGoToPlaylists?.(pl.id)}
              />
            ))
          )}
        </FeedRow>
      )}

      <FeedRow
        title="Trending"
        actionLabel={onGoToSearch ? 'Search' : undefined}
        onAction={onGoToSearch}
      >
        {trendingSongs.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-zinc-400">No songs yet.</p>
        ) : (
          trendingSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              variant="compact"
              className={COMPACT_CARD}
              onPlay={() => handlePlaySong(song, trendingSongs)}
            />
          ))
        )}
      </FeedRow>

      <FeedRow title="New releases">
        {newReleases.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-zinc-400">No new releases.</p>
        ) : (
          newReleases.map((song) => (
            <SongCard
              key={`new-${song.id}`}
              song={song}
              variant="compact"
              className={COMPACT_CARD}
              onPlay={() => handlePlaySong(song, newReleases)}
            />
          ))
        )}
      </FeedRow>

      <FeedRow title="Suggested for you">
        {suggestedSongs.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-zinc-400">Nothing to suggest yet.</p>
        ) : (
          suggestedSongs.map((song) => (
            <SongCard
              key={`sug-${song.id}`}
              song={song}
              variant="compact"
              className={COMPACT_CARD}
              onPlay={() => handlePlaySong(song, suggestedSongs)}
            />
          ))
        )}
      </FeedRow>

      {genreSections.map(({ genre, items }) => (
        <FeedRow key={genre} title={genre}>
          {items.map((song) => (
            <SongCard
              key={`${genre}-${song.id}`}
              song={song}
              variant="compact"
              className={COMPACT_CARD}
              onPlay={() => handlePlaySong(song, items)}
            />
          ))}
        </FeedRow>
      ))}
    </div>
  );
}
