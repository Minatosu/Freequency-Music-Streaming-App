import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FreequencyLogo } from '../components/FreequencyLogo';

interface LoginProps {
  onToggleAuth: () => void;
}

export default function Login({ onToggleAuth }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-sans">
      {/* Left Panel */}
      <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-center p-8 lg:p-16 overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1a3a6e] min-h-[40vh] lg:min-h-screen">
        {/* Floating Album Thumbnails */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80" 
            alt="" 
            className="absolute top-[10%] left-[10%] w-24 lg:w-36 aspect-square object-cover rounded-xl shadow-2xl -rotate-12 border-2 lg:border-4 border-white/10 opacity-80"
          />
          <img 
            src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80" 
            alt="" 
            className="absolute top-[20%] lg:top-[30%] -right-8 lg:right-[5%] w-32 lg:w-48 aspect-square object-cover rounded-xl shadow-2xl rotate-12 border-2 lg:border-4 border-white/10 opacity-70"
          />
          <img 
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80" 
            alt="" 
            className="absolute bottom-[10%] lg:bottom-[20%] left-[20%] lg:left-[25%] w-28 lg:w-40 aspect-square object-cover rounded-xl shadow-2xl -rotate-[15deg] border-2 lg:border-4 border-white/10 opacity-90"
          />
          <div className="absolute inset-0 bg-[#0f172a]/20 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <FreequencyLogo size={56} variant="full" theme="dark" />
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white mt-12 tracking-tight drop-shadow-lg">
            Your music.<br />Your world.
          </h2>
          <p className="text-[#94a3b8] mt-6 text-lg max-w-sm drop-shadow-md">
            Stream millions of songs ad-free, with high-fidelity audio options.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-[#F9F9F9] dark:bg-zinc-950 text-gray-900 dark:text-white">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-gray-600 dark:text-zinc-400">Sign in to continue to your account</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-zinc-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-950/50 text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-[#1a6ff4] focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-950/50 text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-[#1a6ff4] focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a6ff4] text-white py-3 rounded-xl font-medium hover:bg-[#155fcb] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1a6ff4]/20"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
              <p className="text-gray-600 dark:text-zinc-400">
                Don't have an account?{' '}
                <button
                  onClick={onToggleAuth}
                  className="text-[#1a6ff4] font-semibold hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
