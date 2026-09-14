import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, profile, role, loading, switchDemoRole, demoRoles } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-brand-dark border-t-brand-pink rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-brand-dark">Loading credentials and permissions...</p>
      </div>
    );
  }

  // Not authenticated
  if (!user && !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role restrictions if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(role) && role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto my-16 px-4">
        <div className="card-tactile p-8 bg-white text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 text-brand-red border-2 border-brand-dark rounded-2xl flex items-center justify-center mb-6 shadow-tactile-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-brand-dark mb-2">
            Access Restricted
          </h2>
          <p className="text-brand-dark/70 mb-6 max-w-md mx-auto text-sm leading-relaxed">
            Your current active role (<span className="font-bold text-brand-dark uppercase">{role}</span>) does not have permission to view this route.
            Allowed roles: <span className="font-semibold">{allowedRoles.join(', ')}</span>.
          </p>

          {/* Quick role switcher for evaluation */}
          <div className="bg-canvas p-4 rounded-2xl border-2 border-brand-dark mb-6 text-left">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-brand-dark/80">
              <KeyRound className="w-4 h-4 text-brand-pink" />
              Switch Evaluator Persona:
            </div>
            <div className="flex flex-wrap gap-2">
              {demoRoles.map((dr) => (
                <button
                  key={dr.role}
                  onClick={() => switchDemoRole(dr.role)}
                  className={`text-xs px-3 py-1.5 rounded-xl border-2 font-bold transition-all ${
                    role === dr.role
                      ? 'bg-brand-dark text-white border-brand-dark'
                      : 'bg-white text-brand-dark border-brand-dark hover:bg-brand-pink hover:text-white'
                  }`}
                >
                  {dr.name} ({dr.role})
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link
              to="/"
              className="btn-tactile-white px-5 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
