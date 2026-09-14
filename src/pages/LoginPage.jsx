import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const { signIn, signUp, switchDemoRole, demoRoles, role } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [chosenRole, setChosenRole] = useState('patient');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const { error } = await signUp(email, password, name, chosenRole);
        if (error) {
          setErrorMsg(error.message || 'Registration failed.');
          setLoading(false);
          return;
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message || 'Sign in failed. Check your credentials.');
          setLoading(false);
          return;
        }
      }

      // Successful login -> Redirect
      if (from) {
        navigate(from, { replace: true });
      } else {
        const targetDashboard = getDashboardForRole(isRegister ? chosenRole : (role || 'admin'));
        navigate(targetDashboard, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoRole) => {
    switchDemoRole(demoRole.role);
    if (from) {
      navigate(from, { replace: true });
    } else {
      navigate(demoRole.dashboardPath, { replace: true });
    }
  };

  function getDashboardForRole(r) {
    switch (r) {
      case 'doctor':
        return '/dashboard/doctor';
      case 'clinic-staff':
        return '/dashboard/clinic';
      case 'pharmacist':
        return '/dashboard/pharmacy';
      case 'patient':
        return '/dashboard/patient';
      case 'admin':
      case 'instructor':
      default:
        return '/dashboard/admin';
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-10 space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-brand-red bg-accent-goldLight px-3 py-1 rounded-full border border-accent-gold">
          Supabase Authentication
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
          {isRegister ? 'Create Pharmacon Account' : 'Sign In to Pharmacon'}
        </h1>
        <p className="text-brand-dark/75 text-sm max-w-md mx-auto">
          Access role-specific healthcare dashboards, formulary management, and prescription verification tools.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sign In / Sign Up Form */}
        <div className="lg:col-span-7 card-tactile p-6 sm:p-8 bg-white">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-100 border-2 border-brand-red text-red-900 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-brand-red flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-brand-dark mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh Kumar"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-brand-dark bg-canvas text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-brand-dark mb-1">
                    Select Account Role
                  </label>
                  <select
                    value={chosenRole}
                    onChange={(e) => setChosenRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-brand-dark bg-canvas text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
                  >
                    <option value="doctor">Doctor (Physician)</option>
                    <option value="clinic-staff">Clinic Staff (Verification)</option>
                    <option value="pharmacist">Pharmacist (Dispensing &amp; Inventory)</option>
                    <option value="patient">Patient (Medications &amp; Refills)</option>
                    <option value="admin">System Administrator</option>
                    <option value="instructor">Academic Instructor / Reviewer</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-brand-dark mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@hospital.org"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-brand-dark bg-canvas text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-brand-dark mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-brand-dark bg-canvas text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-tactile-red py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Authenticating with Supabase...</span>
              ) : isRegister ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-brand-dark/10 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className="text-xs font-bold text-brand-crimson hover:underline"
            >
              {isRegister
                ? 'Already have an account? Sign in here'
                : 'Need a new account? Register here'}
            </button>
          </div>
        </div>

        {/* Quick Evaluator Role Switcher */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card-tactile p-6 bg-accent-goldLight space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-accent-gold border-2 border-brand-dark">
                <KeyRound className="w-4 h-4 text-brand-dark" />
              </div>
              <div>
                <h3 className="text-base font-black font-display text-brand-dark">
                  Instant Evaluator Login
                </h3>
                <p className="text-[11px] text-brand-dark/70 font-semibold">
                  1-Click demo persona access for evaluation
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {demoRoles.map((dr) => (
                <button
                  key={dr.role}
                  onClick={() => handleQuickLogin(dr)}
                  className="w-full text-left p-3 rounded-xl border-2 border-brand-dark bg-white hover:bg-brand-pink hover:text-white group transition-all shadow-tactile-sm flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-brand-dark group-hover:text-white">
                      {dr.name}
                    </div>
                    <div className="text-[10px] text-brand-dark/60 group-hover:text-white/80 uppercase font-extrabold">
                      Role: {dr.role}
                    </div>
                  </div>
                  <span className="text-[11px] font-black group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-brand-dark/70 leading-relaxed border-t border-brand-dark/10">
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-700" />
              Each role activates dedicated RLS policies and role-specific dashboard views.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
