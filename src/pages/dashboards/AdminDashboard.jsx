import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { SystemStatsRepository } from '../../lib/dataStore';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Package,
  FileCheck2,
  Presentation,
  ShieldCheck,
  Activity,
  ArrowRight,
  TrendingUp,
  GitBranch,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { profile, role } = useAuth();
  const [stats, setStats] = useState({
    teamCount: 4,
    inventoryCount: 8,
    prescriptionCount: 2,
    auditCount: 2,
    lowStockCount: 2,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const liveStats = await SystemStatsRepository.getStats();
        setStats(liveStats);
      } catch (e) {
        console.warn('Admin stats load error:', e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-red" />
            Administrator Console
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Welcome, {profile?.name || 'System Admin'}
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            System overview of team profiles, formulary inventory, prescription pipeline, and audit logs.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-tactile p-5 bg-white space-y-2">
          <div className="flex items-center justify-between text-brand-dark/60 text-xs font-bold uppercase">
            <span>Team Members</span>
            <Users className="w-4 h-4 text-brand-pink" />
          </div>
          <div className="text-3xl font-black font-display text-brand-dark">{stats.teamCount}</div>
          <Link to="/team" className="text-xs font-bold text-brand-red hover:underline block pt-1">
            Manage Profiles →
          </Link>
        </div>

        <div className="card-tactile p-5 bg-white space-y-2">
          <div className="flex items-center justify-between text-brand-dark/60 text-xs font-bold uppercase">
            <span>Formulary Items</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black font-display text-brand-dark">{stats.inventoryCount}</div>
          <Link to="/inventory" className="text-xs font-bold text-brand-red hover:underline block pt-1">
            View Inventory →
          </Link>
        </div>

        <div className="card-tactile p-5 bg-white space-y-2">
          <div className="flex items-center justify-between text-brand-dark/60 text-xs font-bold uppercase">
            <span>Prescriptions</span>
            <FileCheck2 className="w-4 h-4 text-brand-crimson" />
          </div>
          <div className="text-3xl font-black font-display text-brand-dark">{stats.prescriptionCount}</div>
          <Link to="/prototype" className="text-xs font-bold text-brand-red hover:underline block pt-1">
            Open Pipeline →
          </Link>
        </div>

        <div className="card-tactile p-5 bg-white space-y-2">
          <div className="flex items-center justify-between text-brand-dark/60 text-xs font-bold uppercase">
            <span>Audit Events</span>
            <Activity className="w-4 h-4 text-accent-gold" />
          </div>
          <div className="text-3xl font-black font-display text-brand-dark">{stats.auditCount}</div>
          <Link to="/audit" className="text-xs font-bold text-brand-red hover:underline block pt-1">
            Inspect Log →
          </Link>
        </div>
      </div>

      {/* Quick Navigation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/team"
          className="card-tactile p-6 bg-white space-y-3 hover:-translate-y-1 transition-transform group"
        >
          <div className="p-3 bg-brand-pink/20 rounded-2xl border-2 border-brand-dark text-brand-crimson w-fit">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-display text-brand-dark group-hover:text-brand-crimson">
            Team Profiles &amp; Photos
          </h3>
          <p className="text-xs text-brand-dark/75 leading-relaxed font-medium">
            Edit developer roles, skills, and upload profile avatars to Supabase Storage.
          </p>
        </Link>

        <Link
          to="/presentations"
          className="card-tactile p-6 bg-white space-y-3 hover:-translate-y-1 transition-transform group"
        >
          <div className="p-3 bg-accent-goldLight rounded-2xl border-2 border-brand-dark text-brand-dark w-fit">
            <Presentation className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-display text-brand-dark group-hover:text-brand-crimson">
            Presentation Decks
          </h3>
          <p className="text-xs text-brand-dark/75 leading-relaxed font-medium">
            Upload new PPTX files to Storage and launch built-in interactive slide decks.
          </p>
        </Link>

        <Link
          to="/versions"
          className="card-tactile p-6 bg-white space-y-3 hover:-translate-y-1 transition-transform group"
        >
          <div className="p-3 bg-accent-mintLight rounded-2xl border-2 border-brand-dark text-emerald-900 w-fit">
            <GitBranch className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-display text-brand-dark group-hover:text-brand-crimson">
            Release Changelog
          </h3>
          <p className="text-xs text-brand-dark/75 leading-relaxed font-medium">
            Track milestone deliverables, architecture pivots, and GitHub Pages deployments.
          </p>
        </Link>
      </div>
    </div>
  );
}
