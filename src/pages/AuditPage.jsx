import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Activity,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const INITIAL_AUDIT_LOGS = [
  {
    id: 'AE-001',
    created_at: '2026-08-25T09:15:22Z',
    actor_name: 'Dr. A. Sharma',
    actor_role: 'doctor',
    action: 'Prescription Uploaded',
    entity: 'Prescription',
    entity_id: 'RX-2024-0001',
    details: 'Uploaded high-res clinical prescription photo for Rahul Kumar',
  },
  {
    id: 'AE-002',
    created_at: '2026-08-25T09:15:24Z',
    actor_name: 'System Engine',
    actor_role: 'system',
    action: 'OCR Extraction Generated',
    entity: 'Prescription',
    entity_id: 'RX-2024-0001',
    details: 'Simulated OCR extraction returned 7 structured clinical fields',
  },
  {
    id: 'AE-003',
    created_at: '2026-08-25T09:18:10Z',
    actor_name: 'Priya Desai',
    actor_role: 'clinic-staff',
    action: 'Staff Correction Made',
    entity: 'PrescriptionField',
    entity_id: 'RX-2024-0001',
    details: 'Verified frequency notation from 1-0-2 to 1-0-1',
  },
  {
    id: 'AE-004',
    created_at: '2026-08-25T09:20:45Z',
    actor_name: 'Priya Desai',
    actor_role: 'clinic-staff',
    action: 'Prescription Confirmed',
    entity: 'Prescription',
    entity_id: 'RX-2024-0001',
    details: 'Prescription status updated to confirmed; inventory stock reserved',
  },
  {
    id: 'AE-005',
    created_at: '2026-08-25T14:30:00Z',
    actor_name: 'Rahul Kumar',
    actor_role: 'patient',
    action: 'Refill Requested',
    entity: 'RefillRequest',
    entity_id: 'RF-001',
    details: 'Initiated refill request for Amoxicillin 500 mg',
  },
];

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setLogs(INITIAL_AUDIT_LOGS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('audit_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase audit error:', error.message);
        setLogs(INITIAL_AUDIT_LOGS);
      } else if (data && data.length > 0) {
        setLogs(data);
      } else {
        setLogs(INITIAL_AUDIT_LOGS);
      }
    } catch (err) {
      console.warn('Fetch audit exception:', err);
      setLogs(INITIAL_AUDIT_LOGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'all' || log.actor_role.toLowerCase() === selectedRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-red" />
            Security &amp; Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            System Audit Trail
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Immutable log of all prescription digitizations, clinical field edits, inventory adjustments, and refill status updates.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="btn-tactile-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Log
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border-2 border-brand-dark shadow-tactile-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-brand-dark/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, actor, entity ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-dark/30 bg-canvas text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-dark/60" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 rounded-xl border border-brand-dark/30 bg-canvas text-xs font-bold focus:outline-hidden"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="clinic-staff">Clinic Staff</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="patient">Patient</option>
            <option value="system">System Engine</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-pink mb-3" />
          <p className="font-bold text-sm text-brand-dark">Loading audit events from PostgreSQL...</p>
        </div>
      )}

      {/* Audit Table */}
      {!loading && (
        <div className="card-tactile overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-canvas-dark border-b-2 border-brand-dark text-brand-dark font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Actor &amp; Role</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity Target</th>
                  <th className="py-3.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/10">
                {filteredLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-canvas/50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-brand-dark/70 font-mono">
                      {new Date(item.created_at).toLocaleString()}
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-brand-dark">{item.actor_name}</div>
                      <span className="inline-block text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-brand-pink/15 text-brand-crimson border border-brand-pink/30 mt-0.5">
                        {item.actor_role}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span className="font-black text-brand-dark">{item.action}</span>
                    </td>

                    {/* Entity Target */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-brand-crimson">{item.entity}</span>
                      {item.entity_id && (
                        <span className="block text-[11px] text-brand-dark/60 font-semibold">
                          {item.entity_id}
                        </span>
                      )}
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-4 text-brand-dark/80 max-w-xs truncate">
                      {item.details || '—'}
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-brand-dark/60">
                      <AlertCircle className="w-8 h-8 mx-auto text-accent-gold mb-2" />
                      <p className="font-bold text-sm">No audit logs matching search criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
