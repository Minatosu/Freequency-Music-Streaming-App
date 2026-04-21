import { useApp } from '../context/AppContext';
import { usePlayerStore } from '../store/playerStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeatMode,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    toggleShuffle,
    cycleRepeatMode,
  } = useApp();

  const { isExpanded, setIsExpanded } = usePlayerStore();
  
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  if (!currentSong) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    seekTo(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const rangeTrackClassFull =
    'h-1.5 rounded-full appearance-none cursor-pointer bg-white/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 transition-opacity';

  return (
    <AnimatePresence>
      {isExpanded ? (
        <motion.div
          key="full-player"
          layoutId="player-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] bg-zinc-950 text-white overflow-hidden"
        >
          {/* Blurred Background Art */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-[80px] saturate-200 transition-all duration-700"
            style={{ backgroundImage: `url(${currentSong.cover_image})` }}
          />

          {/* Main layout: locked to screen, no scroll */}
          <div className="relative z-10 fixed inset-0 h-[100dvh] overflow-hidden flex flex-col justify-between py-8 px-6 max-w-screen-sm mx-auto w-full">

            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-full bg-black/20 hover:bg-black/40 transition backdrop-blur-md cursor-pointer"
              >
                <ChevronDown className="w-7 h-7 text-white" />
              </button>
              <span className="text-xs font-semibold uppercase tracking-widest opacity-70">Now Playing</span>
              <div className="w-9" /> {/* spacer */}
            </div>

            {/* Center: Album Art + Title + Artist */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-0">
              <motion.img
                layoutId="album-art"
                src={currentSong.cover_image}
                alt={currentSong.title}
                className="w-full max-w-[min(72vw,320px)] aspect-square object-cover rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
              />
              <div className="w-full max-w-md text-center">
                <motion.h2
                  layoutId="song-title"
                  className="text-2xl font-bold truncate text-white drop-shadow-md leading-tight"
                >
                  {currentSong.title}
                </motion.h2>
                <motion.p
                  layoutId="song-artist"
                  className="text-base opacity-60 truncate mt-1"
                >
                  {currentSong.artist}
                </motion.p>
              </div>
            </div>

            {/* Bottom: Seekbar + Controls + Volume */}
            <div className="shrink-0 flex flex-col items-center gap-6 w-full max-w-md mx-auto">

              {/* Seekbar with timestamps */}
              <div className="w-full">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className={`w-full ${rangeTrackClassFull}`}
                />
                <div className="flex justify-between text-xs tabular-nums opacity-60 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls row */}
              <div className="flex justify-center items-center gap-10 w-full">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleShuffle(); }}
                  className={`transition-colors cursor-pointer active:scale-90 ${shuffle ? 'text-blue-400' : 'text-white/35'} hover:text-blue-500`}
                  title={shuffle ? 'Shuffle on' : 'Shuffle off'}
                >
                  <Shuffle className="w-5 h-5 hover:text-blue-500 transition-colors cursor-pointer" />
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); playPrevious(); }}
                  className="text-white transition-colors cursor-pointer hover:text-blue-500 hover:scale-110 active:scale-90"
                >
                  <SkipBack className="w-7 h-7 hover:text-blue-500 transition-colors cursor-pointer" fill="currentColor" />
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-blue-500 hover:text-white hover:scale-105 active:scale-95 transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" fill="currentColor" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" fill="currentColor" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); playNext(); }}
                  className="text-white transition-colors cursor-pointer hover:text-blue-500 hover:scale-110 active:scale-90"
                >
                  <SkipForward className="w-7 h-7 hover:text-blue-500 transition-colors cursor-pointer" fill="currentColor" />
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); cycleRepeatMode(); }}
                  className={`transition-colors cursor-pointer active:scale-90 ${repeatMode === 'off' ? 'text-white/35' : 'text-blue-400'} hover:text-blue-500`}
                  title={repeatMode === 'off' ? 'Repeat off' : repeatMode === 'all' ? 'Repeat all' : 'Repeat one'}
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="w-5 h-5 hover:text-blue-500 transition-colors cursor-pointer" />
                  ) : (
                    <Repeat className="w-5 h-5 hover:text-blue-500 transition-colors cursor-pointer" />
                  )}
                </button>
              </div>

              {/* Volume row */}
              <div className="flex w-full max-w-xs items-center gap-3 opacity-70">
                <button onClick={toggleMute} className="text-white shrink-0 hover:text-blue-500 transition-colors cursor-pointer">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className={`flex-1 ${rangeTrackClassFull}`}
                />
              </div>

            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="mini-player"
          layoutId="player-container"
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/50 bg-white/95 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/95 px-4 py-3 cursor-pointer will-change-transform"
        >
          {/* Progress bar overlay on mini player top edge */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-zinc-800">
             <div 
               className="h-full bg-[#4A90E2] transition-all duration-300" 
               style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
             />
          </div>

          <div className="mx-auto max-w-screen-xl flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <motion.img
                layoutId="album-art"
                src={currentSong.cover_image}
                alt={currentSong.title}
                className="h-12 w-12 rounded-md object-cover shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              />
              <div className="min-w-0 pr-4">
                <motion.p layoutId="song-title" className="truncate font-medium text-gray-900 dark:text-zinc-50">{currentSong.title}</motion.p>
                <motion.p layoutId="song-artist" className="truncate text-sm text-gray-600 dark:text-zinc-400">{currentSong.artist}</motion.p>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1 pl-3 border-l border-gray-200/60 dark:border-zinc-800">

              {/* Shuffle — desktop only */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleShuffle(); }}
                className={`hidden md:flex rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-zinc-800 ${
                  shuffle ? 'text-[#4A90E2] dark:text-[#6BA8E8]' : 'text-gray-400 dark:text-zinc-500'
                }`}
                aria-pressed={shuffle}
                title={shuffle ? 'Shuffle on' : 'Shuffle off'}
              >
                <Shuffle className="h-4 w-4" strokeWidth={2.25} />
              </button>

              {/* Play / Pause */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="rounded-full p-2 text-gray-900 transition hover:bg-gray-100 dark:text-white dark:hover:bg-zinc-800"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" fill="currentColor" />
                ) : (
                  <Play className="h-6 w-6" fill="currentColor" />
                )}
              </button>

              {/* Skip Next */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); playNext(); }}
                className="rounded-full p-2 text-gray-900 transition hover:bg-gray-100 dark:text-white dark:hover:bg-zinc-800"
                aria-label="Next"
              >
                <SkipForward className="h-5 w-5" />
              </button>

              {/* Repeat — desktop only */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); cycleRepeatMode(); }}
                className={`hidden md:flex rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-zinc-800 ${
                  repeatMode === 'off' ? 'text-gray-400 dark:text-zinc-500' : 'text-[#4A90E2] dark:text-[#6BA8E8]'
                }`}
                aria-label={`Repeat: ${repeatMode}`}
                title={
                  repeatMode === 'off' ? 'Repeat off' : repeatMode === 'all' ? 'Repeat all' : 'Repeat one'
                }
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="h-4 w-4" strokeWidth={2.25} />
                ) : (
                  <Repeat className="h-4 w-4" strokeWidth={2.25} />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
