import { useApp } from '../context/AppContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={currentSong.cover_image}
              alt={currentSong.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{currentSong.title}</p>
              <p className="text-sm text-gray-600 truncate">{currentSong.artist}</p>
            </div>
          </div>

          <div className="flex-1 max-w-2xl hidden md:flex flex-col items-center">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={playPrevious}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Previous"
              >
                <SkipBack className="w-5 h-5 text-gray-700" />
              </button>

              <button
                onClick={togglePlay}
                className="p-3 bg-[#4A90E2] hover:bg-[#357ABD] rounded-full transition"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" fill="white" />
                ) : (
                  <Play className="w-6 h-6 text-white" fill="white" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Next"
              >
                <SkipForward className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-gray-600 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4A90E2] [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#4A90E2] [&::-moz-range-thumb]:border-0"
              />
              <span className="text-xs text-gray-600 w-10">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 bg-[#4A90E2] hover:bg-[#357ABD] rounded-full transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" fill="white" />
              ) : (
                <Play className="w-5 h-5 text-white" fill="white" />
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
            <button onClick={toggleMute} className="p-2 hover:bg-gray-100 rounded-full transition">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-gray-700" />
              ) : (
                <Volume2 className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4A90E2] [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#4A90E2] [&::-moz-range-thumb]:border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
