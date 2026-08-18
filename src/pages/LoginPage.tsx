import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Pill, LogIn, Loader2 } from 'lucide-react';

const demoUsers = [
  { username: 'doctor', password: 'demo', role: 'Doctor' },
  { username: 'clinic', password: 'demo', role: 'Clinic Staff' },
  { username: 'pharmacy', password: 'demo', role: 'Pharmacist' },
  { username: 'patient', password: 'demo', role: 'Patient' },
  { username: 'admin', password: 'demo', role: 'Admin' },
  { username: 'instructor', password: 'demo', role: 'Instructor' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(username, password);
    if (!success) {
      setError('Invalid credentials. Use any demo account below.');
    }
    setLoading(false);
  };

  const quickLogin = async (user: string, pass: string) => {
    setLoading(true);
    setError('');
    const success = await login(user, pass);
    if (!success) {
      setError('Login failed. Is the server running?');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm animate-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center mx-auto mb-3">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Pharmacon</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to continue</p>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                className="input"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter username"
                disabled={loading}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                disabled={loading}
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" className="btn-primary w-full gap-2" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick access */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              {demoUsers.map((user) => (
                <button
                  key={user.username}
                  onClick={() => quickLogin(user.username, user.password)}
                  disabled={loading}
                  className="px-3 py-2 text-left bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  <div className="text-xs font-medium text-slate-700">{user.role}</div>
                  <div className="text-[10px] text-slate-400">{user.username} / {user.password}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
