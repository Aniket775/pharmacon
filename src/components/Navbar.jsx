import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Package,
  Layers,
  Users,
  Presentation,
  Shield,
  Menu,
  X,
  LogIn,
  LogOut,
  ChevronDown,
  Sparkles,
  GitBranch,
  Cpu,
  FileCheck,
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const { user, profile, role, signOut, switchDemoRole, demoRoles } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Project', path: '/project' },
    { name: 'System', path: '/proposed-system' },
    { name: 'Prototype', path: '/prototype' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Doctor AI', path: '/doctor-adaptation' },
    { name: 'Decks', path: '/presentations' },
    { name: 'Team', path: '/team' },
    { name: 'Audit', path: '/audit' },
  ];

  const getDashboardPath = (userRole) => {
    switch (userRole) {
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
  };

  const activeDashboardPath = getDashboardPath(role);

  return (
    <header className="sticky top-0 z-40 bg-canvas border-b-3 border-brand-dark shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-brand-red rounded-2xl border-2 border-brand-dark flex items-center justify-center text-canvas font-black font-display text-2xl shadow-tactile-sm group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
                P
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-2xl tracking-tight text-brand-dark">
                    Pharmacon
                  </span>
                  <span className="bg-accent-gold text-brand-dark text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-brand-dark">
                    v2.0
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-brand-dark/60 block -mt-1">
                  UCS503 Capstone Engine
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-brand-dark text-canvas shadow-tactile-sm'
                      : 'text-brand-dark hover:bg-brand-pink/20'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Controls & Role Switcher */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 bg-white border-2 border-brand-dark px-3 py-1.5 rounded-xl shadow-tactile-sm text-xs font-bold text-brand-dark hover:bg-canvas-dark transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
                <span className="uppercase">{role || 'guest'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-brand-dark rounded-2xl shadow-tactile-md p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-brand-dark/10 mb-1">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-brand-dark/60">
                      Switch Role (Evaluator Demo)
                    </p>
                  </div>
                  {demoRoles.map((dr) => (
                    <button
                      key={dr.role}
                      onClick={() => {
                        switchDemoRole(dr.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        role === dr.role
                          ? 'bg-brand-pink text-white'
                          : 'hover:bg-canvas text-brand-dark'
                      }`}
                    >
                      <div>
                        <div>{dr.name}</div>
                        <div className={`text-[10px] font-normal ${role === dr.role ? 'text-white/80' : 'text-brand-dark/60'}`}>
                          {dr.role}
                        </div>
                      </div>
                      {role === dr.role && <span className="text-xs font-black">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dashboard Link */}
            <Link
              to={activeDashboardPath}
              className="btn-tactile-gold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4" />
              Dashboard
            </Link>

            {/* Auth Button */}
            {user || profile ? (
              <button
                onClick={signOut}
                className="btn-tactile-white px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:bg-brand-pink hover:text-white"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="btn-tactile-pink px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center gap-2">
            <Link
              to={activeDashboardPath}
              className="btn-tactile-gold px-2.5 py-1.5 rounded-lg text-xs font-bold"
            >
              Dashboard
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-brand-dark rounded-xl bg-white text-brand-dark shadow-tactile-sm"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-canvas border-t-2 border-brand-dark px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-brand-dark/10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-sm font-bold ${
                  location.pathname === link.path
                    ? 'bg-brand-dark text-canvas'
                    : 'bg-white border border-brand-dark text-brand-dark'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Quick Role Switcher for Mobile */}
          <div className="pt-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-dark/70 mb-2">
              Active Role Switcher:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {demoRoles.map((dr) => (
                <button
                  key={dr.role}
                  onClick={() => {
                    switchDemoRole(dr.role);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-[11px] p-1.5 rounded-lg border font-bold text-center ${
                    role === dr.role
                      ? 'bg-brand-red text-white border-brand-dark'
                      : 'bg-white text-brand-dark border-brand-dark/30'
                  }`}
                >
                  {dr.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
