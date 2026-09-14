import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { logAuditEvent } from '../lib/auditLogger';

const AuthContext = createContext(null);

export const DEMO_ROLES = [
  {
    role: 'admin',
    name: 'System Admin',
    email: 'admin@pharmacon.local',
    description: 'Full administrative access: Team, Inventory, Releases, Decks & Audits',
    dashboardPath: '/dashboard/admin',
  },
  {
    role: 'doctor',
    name: 'Dr. A. Sharma',
    email: 'doctor@pharmacon.local',
    description: 'Prescription queue, patient verification, adaptation calibration',
    dashboardPath: '/dashboard/doctor',
  },
  {
    role: 'clinic-staff',
    name: 'Priya Desai',
    email: 'clinic@pharmacon.local',
    description: 'Human-in-the-loop review, confidence verification & correction',
    dashboardPath: '/dashboard/clinic',
  },
  {
    role: 'pharmacist',
    name: 'Vikram Singh',
    email: 'pharmacy@pharmacon.local',
    description: 'Inventory levels, stock adjustments, formulary matching & refill processing',
    dashboardPath: '/dashboard/pharmacy',
  },
  {
    role: 'patient',
    name: 'Rahul Kumar',
    email: 'patient@pharmacon.local',
    description: 'Medication schedule, prescription history & refill requests',
    dashboardPath: '/dashboard/patient',
  },
  {
    role: 'instructor',
    name: 'Lead Clinical Auditor',
    email: 'auditor@pharmacon.local',
    description: 'Clinical evaluation, system milestone reviews & audit trail oversight',
    dashboardPath: '/dashboard/admin',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured()) {
        // Supabase not configured yet - load demo admin as default guest state
        setProfile({
          id: 'demo-admin-id',
          name: 'System Admin',
          email: 'admin@pharmacon.local',
          role: 'admin',
        });
        setRole('admin');
        setUser({ id: 'demo-admin-id', email: 'admin@pharmacon.local' });
        setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user && mounted) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else if (mounted) {
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      } catch (err) {
        console.warn('Supabase auth session error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Listen for auth state changes if configured
    let subscription = null;
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
      });
      subscription = data?.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Could not load profile from Supabase:', error.message);
        return null;
      }

      if (data) {
        setProfile(data);
        setRole(data.role);
        return data;
      }
    } catch (err) {
      console.warn('Profile fetch exception:', err);
    }
    return null;
  }

  // Real Supabase Sign In
  async function signIn(email, password) {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        // Fallback for offline demo mode
        const demo = DEMO_ROLES.find((d) => d.email.toLowerCase() === email.toLowerCase()) || DEMO_ROLES[0];
        const newProf = {
          id: 'demo-' + demo.role + '-id',
          name: demo.name,
          email: demo.email,
          role: demo.role,
        };
        setUser({ id: newProf.id, email: newProf.email });
        setProfile(newProf);
        setRole(newProf.role);
        return { data: { user: newProf }, error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        setUser(data.user);
        const userProf = await loadProfile(data.user.id);
        await logAuditEvent({
          actorId: data.user.id,
          actorName: userProf?.name || data.user.email,
          actorRole: userProf?.role || 'authenticated',
          action: 'User Logged In',
          entity: 'Auth',
          entityId: data.user.id,
          details: `Sign-in for ${data.user.email}`,
        });
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }

  // Real Supabase Sign Up
  async function signUp(email, password, name, chosenRole = 'patient') {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        const newProf = {
          id: 'demo-user-' + Math.random().toString(36).substring(2, 7),
          name: name || 'Demo User',
          email,
          role: chosenRole,
        };
        setUser({ id: newProf.id, email: newProf.email });
        setProfile(newProf);
        setRole(newProf.role);
        return { data: { user: newProf }, error: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: chosenRole },
        },
      });

      if (error) throw error;

      if (data?.user) {
        // Insert profile record in database
        const { error: profError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email,
            name,
            role: chosenRole,
          },
        ]);

        if (profError) {
          console.warn('Profile creation warning:', profError.message);
        }

        await loadProfile(data.user.id);
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }

  // Sign Out
  async function signOut() {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setRole(null);
      setLoading(false);
    }
  }

  // Switch demo persona (makes it instant for evaluators to test all 6 roles)
  function switchDemoRole(targetRole) {
    const demo = DEMO_ROLES.find((d) => d.role === targetRole) || DEMO_ROLES[0];
    const newProf = {
      id: 'demo-' + demo.role + '-id',
      name: demo.name,
      email: demo.email,
      role: demo.role,
    };
    setUser({ id: newProf.id, email: newProf.email });
    setProfile(newProf);
    setRole(newProf.role);

    logAuditEvent({
      actorId: newProf.id,
      actorName: newProf.name,
      actorRole: newProf.role,
      action: 'Role Switched (Evaluator Mode)',
      entity: 'Session',
      entityId: newProf.role,
      details: `Active role switched to ${demo.name} (${demo.role})`,
    });
  }

  const value = {
    user,
    profile,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    switchDemoRole,
    demoRoles: DEMO_ROLES,
    isAuthenticated: Boolean(user || profile),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
