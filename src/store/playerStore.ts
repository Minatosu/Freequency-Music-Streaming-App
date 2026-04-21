import { create } from 'zustand';
import { Song } from '../lib/supabase';

interface PlayerState {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isExpanded: false,
  setIsExpanded: (expanded) => set({ isExpanded: expanded }),
  currentSong: null,
  setCurrentSong: (song) => set({ currentSong: song }),
}));
