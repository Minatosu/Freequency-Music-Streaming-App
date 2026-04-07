import { useEffect, useState } from 'react';
import { Song } from '../lib/supabase';
import { Play } from 'lucide-react';

/** Inline music icon (Lucide Music paths) when `cover_image` is missing or fails to load — no external URLs. */
const MUSIC_PLACEHOLDER_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
)}`;

interface SongCardProps {
  song: Song;
  onPlay: () => void;
  /** Compact tile for home rows / carousels */
  variant?: 'default' | 'compact';
  className?: string;
}

export default function SongCard({ song, onPlay, variant = 'default', className = '' }: SongCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    setCoverFailed(false);
  }, [song.id, song.cover_image]);

  const hasCover = Boolean(song.cover_image?.trim());
  const isCompact = variant === 'compact';

  return (
    <div
      className={[
        isCompact
          ? 'group cursor-pointer overflow-visible border-0 bg-transparent shadow-none dark:bg-transparent transition-all duration-200 ease-in-out hover:scale-[1.03]'
          : 'group cursor-pointer overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm transition-all duration-200 ease-in-out hover:scale-[1.03] hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-900 dark:shadow-black/20 dark:hover:border-zinc-600 dark:hover:shadow-lg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'relative aspect-square overflow-hidden bg-zinc-200 dark:bg-zinc-800',
          isCompact
            ? 'rounded-md shadow-sm ring-1 ring-black/[0.06] transition-shadow duration-200 ease-in-out group-hover:shadow-md dark:ring-white/[0.08]'
            : '',
        ].join(' ')}
      >
        {coverFailed || !hasCover ? (
          <img
            src={MUSIC_PLACEHOLDER_SRC}
            alt=""
            className="h-full w-full object-cover transition-transform duration-200 ease-in-out"
            aria-hidden
          />
        ) : (
          <img
            src={song.cover_image}
            alt={song.title}
            className="h-full w-full object-cover transition-transform duration-200 ease-in-out"
            onError={() => setCoverFailed(true)}
          />
        )}
        <button
          type="button"
          onClick={onPlay}
          className="absolute inset-0 flex items-end justify-end p-2 bg-black bg-opacity-0 transition-all duration-200 ease-in-out group-hover:bg-opacity-20"
          aria-label={`Play ${song.title}`}
        >
          <div
            className={[
              'scale-0 transform rounded-full bg-[#1a6ff4] shadow-md transition-all duration-200 ease-in-out group-hover:scale-100',
              isCompact ? 'p-2' : 'p-3',
            ].join(' ')}
          >
            <Play 
              className={isCompact ? 'h-4 w-4 text-white ml-0.5' : 'h-5 w-5 text-white ml-0.5'} 
              fill="white" 
            />
          </div>
        </button>
      </div>
      <div className={isCompact ? 'p-2' : 'p-4'}>
        <h3
          className={[
            'truncate font-semibold text-zinc-900 transition-colors duration-200 ease-in-out group-hover:text-[#1a6ff4] dark:text-white',
            isCompact ? 'mb-0.5 text-xs leading-tight' : 'mb-1',
          ].join(' ')}
        >
          {song.title}
        </h3>
        <p
          className={[
            'truncate text-zinc-600 dark:text-zinc-400',
            isCompact ? 'text-[11px] leading-tight' : 'text-sm',
          ].join(' ')}
        >
          {song.artist}
        </p>
        {!isCompact && (
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">{song.genre}</p>
        )}
      </div>
    </div>
  );
}
