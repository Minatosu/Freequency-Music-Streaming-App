import { Moon, Sun } from 'lucide-react';

type ThemeToggleProps = {
  isDark: boolean;
  onToggle: () => void;
  /** Bordered style for floating use on auth / loading screens */
  bordered?: boolean;
  className?: string;
};

export default function ThemeToggle({
  isDark,
  onToggle,
  bordered = false,
  className = '',
}: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950',
        bordered
          ? 'border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
          : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
