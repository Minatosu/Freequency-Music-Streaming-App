import { Song } from '../lib/supabase';
import { Play } from 'lucide-react';

interface SongCardProps {
  song: Song;
  onPlay: () => void;
}

export default function SongCard({ song, onPlay }: SongCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={song.cover_image}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all"
        >
          <div className="bg-[#4A90E2] rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 text-white" fill="white" />
          </div>
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate mb-1">{song.title}</h3>
        <p className="text-sm text-gray-600 truncate">{song.artist}</p>
        <p className="text-xs text-gray-500 mt-1">{song.genre}</p>
      </div>
    </div>
  );
}
