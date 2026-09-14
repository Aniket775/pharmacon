import React from 'react';

const statusStyles = {
  // Inventory
  'in-stock': 'bg-accent-mintLight text-brand-dark border-accent-mint',
  'low-stock': 'bg-accent-goldLight text-brand-dark border-accent-gold',
  'out-of-stock': 'bg-brand-pink/20 text-brand-crimson border-brand-pink',

  // Prescriptions
  'draft': 'bg-gray-100 text-gray-800 border-gray-400',
  'confirmed': 'bg-accent-mintLight text-emerald-800 border-emerald-400',
  'dispensed': 'bg-accent-purpleLight text-purple-900 border-purple-300',

  // Refill
  'pending': 'bg-accent-goldLight text-amber-900 border-amber-400',
  'approved': 'bg-accent-mintLight text-emerald-800 border-emerald-400',
  'rejected': 'bg-red-100 text-red-800 border-red-400',
  'contacted': 'bg-accent-blueLight text-blue-800 border-blue-300',

  // Deliverables & Versions
  'current': 'bg-accent-mintLight text-emerald-900 border-emerald-400',
  'future': 'bg-accent-purpleLight text-purple-900 border-purple-300',
  'archived': 'bg-gray-200 text-gray-700 border-gray-400',
  'published': 'bg-accent-mintLight text-emerald-800 border-emerald-400',
  'in-progress': 'bg-accent-goldLight text-amber-900 border-amber-400',
};

export default function StatusBadge({ status, label, className = '' }) {
  const norm = (status || '').toLowerCase().trim();
  const style = statusStyles[norm] || 'bg-gray-100 text-brand-dark border-gray-300';
  const displayLabel = label || status || 'Unknown';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {displayLabel}
    </span>
  );
}
