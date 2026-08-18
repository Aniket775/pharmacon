import { useEffect, useState } from 'react';
import { Package, CheckCircle, AlertTriangle, Phone } from 'lucide-react';
import { api } from '../../api/client';

export default function PharmacyDashboard() {
  const [refills, setRefills] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([api.get<{ refills: any[] }>('/refills'), api.get<{ items: any[] }>('/inventory')])
      .then(([refillData, inventoryData]) => { setRefills(refillData.refills); setInventory(inventoryData.items); })
      .catch(() => {});
  }, []);

  const updateRefillStatus = (id: string, status: 'approved' | 'rejected' | 'contacted') => {
    api.put(`/refills/${id}`, { status }).then(() => {
      setRefills(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }).catch((err) => alert(err.message));
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Pharmacy Portal</h1>
      <p className="page-subtitle">Vikram Singh — Inventory, confirmations and refill requests.</p>

      <div className="max-w-4xl space-y-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 animate-in">
          <div className="stat-card">
            <div className="stat-value">{inventory.length}</div>
            <div className="stat-label">Formulary Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{inventory.filter(i => i.status === 'low-stock').length}</div>
            <div className="stat-label">Low Stock</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{inventory.filter(i => i.status === 'out-of-stock').length}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{refills.filter(r => r.status === 'pending').length}</div>
            <div className="stat-label">Pending Refills</div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {inventory.filter(i => i.status !== 'in-stock').length > 0 && (
          <section className="animate-in-delay-1">
            <h2 className="section-heading flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Stock Alerts
            </h2>
            <div className="card divide-y divide-slate-100">
              {inventory.filter(i => i.status !== 'in-stock').map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{item.medicine} {item.strength}</div>
                    <div className="text-xs text-slate-500">{item.sku} · Stock: {item.stock}</div>
                  </div>
                  <span className={item.status === 'out-of-stock' ? 'badge-red' : 'badge-yellow'}>
                    {item.status === 'out-of-stock' ? 'Out of Stock' : 'Low Stock'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Refill Requests */}
        <section className="animate-in-delay-2">
          <h2 className="section-heading">Refill Requests</h2>
          <div className="card divide-y divide-slate-100">
            {refills.map((refill) => (
              <div key={refill.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{refill.patientName}</div>
                    <div className="text-xs text-slate-500">{refill.medicine} · Requested: {refill.requestDate}</div>
                  </div>
                  <span className={
                    refill.status === 'pending' ? 'badge-yellow' :
                    refill.status === 'approved' ? 'badge-green' :
                    refill.status === 'rejected' ? 'badge-red' :
                    'badge-blue'
                  }>
                    {refill.status.charAt(0).toUpperCase() + refill.status.slice(1)}
                  </span>
                </div>
                {refill.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => updateRefillStatus(refill.id, 'approved')} className="btn-primary text-xs py-1 px-2">
                      <CheckCircle className="w-3 h-3 mr-1" />Approve
                    </button>
                    <button onClick={() => updateRefillStatus(refill.id, 'rejected')} className="btn-secondary text-xs py-1 px-2">
                      Reject
                    </button>
                    <button onClick={() => updateRefillStatus(refill.id, 'contacted')} className="btn-ghost text-xs py-1 px-2">
                      <Phone className="w-3 h-3 mr-1" />Contact
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
