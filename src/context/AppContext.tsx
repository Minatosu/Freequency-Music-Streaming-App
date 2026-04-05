import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Song } from '../lib/supabase';

export type RepeatMode = 'off' | 'all' | 'one';

interface AppContextType {
  user: User | null;
  loading: boolean;
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  playSong: (song: Song, songQueue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setShuffle: (value: boolean) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [shuffle, setShuffleState] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef(queue);
  const currentSongRef = useRef(currentSong);
  const repeatModeRef = useRef(repeatMode);
  const shuffleRef = useRef(shuffle);

  queueRef.current = queue;
  currentSongRef.current = currentSong;
  repeatModeRef.current = repeatMode;
  shuffleRef.current = shuffle;

  const playSong = useCallback((song: Song, songQueue?: Song[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = song.file_url;
    void audio.play().catch(() => setIsPlaying(false));
    setCurrentSong(song);
    setIsPlaying(true);
    if (songQueue && songQueue.length > 0) {
      setQueue(songQueue);
    }
  }, []);

  const goNext = useCallback(() => {
    const q = queueRef.current;
    const cur = currentSongRef.current;
    const audio = audioRef.current;
    if (!cur || q.length === 0 || !audio) return;

    const idx = q.findIndex((s) => s.id === cur.id);
    if (idx === -1) return;

    if (repeatModeRef.current === 'one') {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
      return;
    }

    if (shuffleRef.current && q.length > 1) {
      let nextIdx = Math.floor(Math.random() * q.length);
      let guard = 0;
      while (nextIdx === idx && guard++ < 32) {
        nextIdx = Math.floor(Math.random() * q.length);
      }
      playSong(q[nextIdx], q);
      return;
    }

    const nextIdx = idx + 1;
    if (nextIdx >= q.length) {
      if (repeatModeRef.current === 'off') {
        setIsPlaying(false);
        return;
      }
      playSong(q[0], q);
      return;
    }
    playSong(q[nextIdx], q);
  }, [playSong]);

  const goPrevious = useCallback(() => {
    const q = queueRef.current;
    const cur = currentSongRef.current;
    const audio = audioRef.current;
    if (!cur || !audio || q.length === 0) return;

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const idx = q.findIndex((s) => s.id === cur.id);
    if (idx === -1) return;

    if (idx === 0) {
      if (repeatModeRef.current === 'off') {
        audio.currentTime = 0;
        setCurrentTime(0);
        return;
      }
      playSong(q[q.length - 1], q);
      return;
    }
    playSong(q[idx - 1], q);
  }, [playSong]);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnded = () => goNext();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audioRef.current = null;
    };
  }, [goNext]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSongRef.current) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
    } else {
      void audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolumeState(vol);
    }
  }, []);

  const setShuffle = useCallback((value: boolean) => {
    setShuffleState(value);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffleState((s) => !s);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((m) => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'));
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentSong(null);
    setIsPlaying(false);
    setQueue([]);
    setShuffleState(false);
    setRepeatMode('all');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        currentSong,
        isPlaying,
        queue,
        currentTime,
        duration,
        volume,
        shuffle,
        repeatMode,
        playSong,
        togglePlay,
        playNext: goNext,
        playPrevious: goPrevious,
        seekTo,
        setVolume,
        setShuffle,
        toggleShuffle,
        cycleRepeatMode,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
