import { useApp } from '../context/AppContext';
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

  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  if (!currentSong) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const rangeTrackClass =
    'h-1.5 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-zinc-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4A90E2] [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:shadow-[#4A90E2]/40 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#4A90E2] [&::-moz-range-thumb]:border-0';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 shadow-[0_-8px_32px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-zinc-700/80 dark:bg-zinc-900/95 dark:shadow-[0_-12px_40px_rgba(0,0,0,0.55)] px-4 py-3.5">
      <div className="mx-auto max-w-screen-xl">
        <div className="flex items-center gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src={currentSong.cover_image}
              alt={currentSong.title}
              className="h-12 w-12 rounded-md object-cover shadow-sm ring-1 ring-black/5 dark:ring-white/10"
            />
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900 dark:text-zinc-50">{currentSong.title}</p>
              <p className="truncate text-sm text-gray-600 dark:text-zinc-400">{currentSong.artist}</p>
            </div>
          </div>

          <div className="hidden max-w-2xl flex-1 flex-col items-center md:flex">
            <div className="mb-2 flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={toggleShuffle}
                className={`rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-zinc-800 ${
                  shuffle
                    ? 'text-[#4A90E2] dark:text-[#6BA8E8]'
                    : 'text-gray-500 dark:text-zinc-500'
                }`}
                title={shuffle ? 'Shuffle on' : 'Shuffle off'}
                aria-pressed={shuffle}
              >
                <Shuffle className="h-5 w-5" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={playPrevious}
                className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                title="Previous"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="rounded-full bg-[#4A90E2] p-3 shadow-md shadow-[#4A90E2]/25 transition hover:bg-[#357ABD] dark:shadow-[#4A90E2]/20"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-white" fill="white" />
                ) : (
                  <Play className="h-6 w-6 text-white" fill="white" />
                )}
              </button>

              <button
                type="button"
                onClick={playNext}
                className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                title="Next"
              >
                <SkipForward className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={cycleRepeatMode}
                className={`rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-zinc-800 ${
                  repeatMode === 'off'
                    ? 'text-gray-500 dark:text-zinc-500'
                    : 'text-[#4A90E2] dark:text-[#6BA8E8]'
                }`}
                title={
                  repeatMode === 'off'
                    ? 'Repeat off (click for queue)'
                    : repeatMode === 'all'
                      ? 'Repeat queue (click for one)'
                      : 'Repeat one (click to off)'
                }
                aria-label={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="h-5 w-5" strokeWidth={2.25} />
                ) : (
                  <Repeat className="h-5 w-5" strokeWidth={2.25} />
                )}
              </button>
            </div>

            <div className="flex w-full items-center gap-2">
              <span className="w-10 text-right text-xs tabular-nums text-gray-600 dark:text-zinc-400">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className={`flex-1 ${rangeTrackClass}`}
              />
              <span className="w-10 text-xs tabular-nums text-gray-600 dark:text-zinc-400">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-0.5 md:hidden">
            <button
              type="button"
              onClick={toggleShuffle}
              className={`rounded-full p-1.5 ${shuffle ? 'text-[#4A90E2]' : 'text-zinc-500'}`}
              aria-pressed={shuffle}
            >
              <Shuffle className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <button type="button" onClick={playPrevious} className="rounded-full p-1.5 text-zinc-600 dark:text-zinc-300">
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="rounded-full bg-[#4A90E2] p-2 shadow-md shadow-[#4A90E2]/25"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-white" fill="white" />
              ) : (
                <Play className="h-5 w-5 text-white" fill="white" />
              )}
            </button>
            <button type="button" onClick={playNext} className="rounded-full p-1.5 text-zinc-600 dark:text-zinc-300">
              <SkipForward className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={cycleRepeatMode}
              className={`rounded-full p-1.5 ${repeatMode === 'off' ? 'text-zinc-500' : 'text-[#4A90E2]'}`}
              aria-label={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="h-4 w-4" strokeWidth={2.25} />
              ) : (
                <Repeat className="h-4 w-4" strokeWidth={2.25} />
              )}
            </button>
          </div>

          <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
            <button
              onClick={toggleMute}
              className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className={`w-28 ${rangeTrackClass}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
