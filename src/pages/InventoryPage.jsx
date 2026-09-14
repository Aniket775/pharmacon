import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { InventoryRepository } from '../lib/dataStore';
import { useAuth } from '../context/AuthContext';
import { logAuditEvent } from '../lib/auditLogger';
import {
  Package,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Filter,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const INITIAL_SEED_INVENTORY = [
  {
    id: 'INV-001',
    medicine: 'Amoxicillin',
    generic_name: 'Amoxicillin Trihydrate',
    strength: '500 mg',
    dosage_form: 'Capsule',
    pack_size: '100 caps',
    sku: 'AMX-500-CAP',
    stock: 142,
    reorder_level: 25,
  },
  {
    id: 'INV-002',
    medicine: 'Metformin',
    generic_name: 'Metformin Hydrochloride',
    strength: '500 mg',
    dosage_form: 'Tablet',
    pack_size: '60 tabs',
    sku: 'MET-500-TAB',
    stock: 18,
    reorder_level: 20,
  },
  {
    id: 'INV-003',
    medicine: 'Paracetamol',
    generic_name: 'Acetaminophen',
    strength: '650 mg',
    dosage_form: 'Tablet',
    pack_size: '100 tabs',
    sku: 'PAR-650-TAB',
    stock: 240,
    reorder_level: 30,
  },
  {
    id: 'INV-004',
    medicine: 'Azithromycin',
    generic_name: 'Azithromycin Dihydrate',
    strength: '500 mg',
    dosage_form: 'Tablet',
    pack_size: '30 tabs',
    sku: 'AZI-500-TAB',
    stock: 8,
    reorder_level: 15,
  },
  {
    id: 'INV-005',
    medicine: 'Omeprazole',
    generic_name: 'Omeprazole Magnesium',
    strength: '20 mg',
    dosage_form: 'Capsule',
    pack_size: '100 caps',
    sku: 'OMP-020-CAP',
    stock: 89,
    reorder_level: 25,
  },
  {
    id: 'INV-006',
    medicine: 'Cetirizine',
    generic_name: 'Cetirizine Hydrochloride',
    strength: '10 mg',
    dosage_form: 'Tablet',
    pack_size: '100 tabs',
    sku: 'CTZ-010-TAB',
    stock: 200,
    reorder_level: 40,
  },
  {
    id: 'INV-007',
    medicine: 'Atorvastatin',
    generic_name: 'Atorvastatin Calcium',
    strength: '10 mg',
    dosage_form: 'Tablet',
    pack_size: '100 tabs',
    sku: 'ATV-010-TAB',
    stock: 45,
    reorder_level: 20,
  },
  {
    id: 'INV-008',
    medicine: 'Ibuprofen',
    generic_name: 'Ibuprofen',
    strength: '400 mg',
    dosage_form: 'Tablet',
    pack_size: '100 tabs',
    sku: 'IBP-400-TAB',
    stock: 12,
    reorder_level: 25,
  },
];

export default function InventoryPage() {
  const { role, profile, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStock, setFilterStock] = useState('all'); // all | low | out
  const [toast, setToast] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    medicine: '',
    generic_name: '',
    strength: '',
    dosage_form: 'Tablet',
    pack_size: '',
    sku: '',
    stock: 0,
    reorder_level: 10,
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await InventoryRepository.getAll();
      setItems(data);
    } catch (err) {
      console.warn('Fetch inventory note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Stock Increment / Decrement
  const handleStockChange = async (item, delta) => {
    const newStock = Math.max(0, item.stock + delta);
    if (newStock === item.stock) return;

    try {
      const updated = await InventoryRepository.updateStock(item.id, newStock);

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? updated : it))
      );

      await logAuditEvent({
        actorName: profile?.name || user?.email || 'Staff',
        actorRole: role || 'pharmacist',
        action: `Stock ${delta > 0 ? 'Increased' : 'Decreased'}`,
        entity: 'InventoryItem',
        entityId: item.id,
        details: `${item.medicine} (${item.sku}) stock changed from ${item.stock} to ${newStock}`,
      });

      setToast({
        type: 'success',
        message: `${item.medicine} stock updated to ${newStock}.`,
      });
    } catch (err) {
      console.error('Stock update error:', err);
      setToast({ type: 'error', message: `Stock update failed: ${err.message}` });
    }
  };

  // Add Item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const newItem = await InventoryRepository.addItem({
        medicine: formData.medicine,
        generic_name: formData.generic_name || formData.medicine,
        strength: formData.strength,
        dosage_form: formData.dosage_form,
        pack_size: formData.pack_size || '100 units',
        sku: formData.sku || (formData.medicine.slice(0, 3).toUpperCase() + '-' + parseInt(formData.strength || '100') + '-SKU'),
        stock: parseInt(formData.stock) || 0,
        reorder_level: parseInt(formData.reorder_level) || 10,
      });

      setItems((prev) => [...prev, newItem]);
      await logAuditEvent({
        actorName: profile?.name || user?.email || 'Staff',
        actorRole: role || 'pharmacist',
        action: 'Added Inventory Medicine',
        entity: 'InventoryItem',
        entityId: newItem.id,
        details: `Added ${newItem.medicine} (${newItem.strength}) to formulary`,
      });

      setToast({ type: 'success', message: `${newItem.medicine} added to inventory!` });
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Add item error:', err);
      setToast({ type: 'error', message: `Add failed: ${err.message}` });
    }
  };

  // Edit Item
  const handleEditItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const updatedPayload = {
        medicine: formData.medicine,
        generic_name: formData.generic_name,
        strength: formData.strength,
        dosage_form: formData.dosage_form,
        pack_size: formData.pack_size,
        sku: formData.sku,
        stock: Math.max(0, parseInt(formData.stock) || 0),
        reorder_level: parseInt(formData.reorder_level) || 10,
      };

      const updated = await InventoryRepository.updateItem(editingItem.id, updatedPayload);

      setItems((prev) =>
        prev.map((it) => (it.id === editingItem.id ? updated : it))
      );

      await logAuditEvent({
        actorName: profile?.name || user?.email || 'Staff',
        actorRole: role || 'pharmacist',
        action: 'Edited Inventory Item',
        entity: 'InventoryItem',
        entityId: editingItem.id,
        details: `Updated details for ${formData.medicine}`,
      });

      setToast({ type: 'success', message: `Updated ${formData.medicine} successfully!` });
      setEditingItem(null);
      resetForm();
    } catch (err) {
      console.error('Edit item error:', err);
      setToast({ type: 'error', message: `Edit failed: ${err.message}` });
    }
  };

  // Delete Item
  const handleDeleteItem = async () => {
    if (!deletingItem) return;

    try {
      await InventoryRepository.deleteItem(deletingItem.id);

      setItems((prev) => prev.filter((it) => it.id !== deletingItem.id));

      await logAuditEvent({
        actorName: profile?.name || user?.email || 'Admin',
        actorRole: role || 'admin',
        action: 'Deleted Inventory Item',
        entity: 'InventoryItem',
        entityId: deletingItem.id,
        details: `Deleted ${deletingItem.medicine} from formulary`,
      });

      setToast({ type: 'success', message: `${deletingItem.medicine} removed from inventory.` });
      setDeletingItem(null);
    } catch (err) {
      console.error('Delete item error:', err);
      setToast({ type: 'error', message: `Delete failed: ${err.message}` });
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      medicine: item.medicine,
      generic_name: item.generic_name || '',
      strength: item.strength,
      dosage_form: item.dosage_form,
      pack_size: item.pack_size,
      sku: item.sku,
      stock: item.stock,
      reorder_level: item.reorder_level,
    });
  };

  const resetForm = () => {
    setFormData({
      medicine: '',
      generic_name: '',
      strength: '',
      dosage_form: 'Tablet',
      pack_size: '',
      sku: '',
      stock: 0,
      reorder_level: 10,
    });
  };

  const getItemStatus = (item) => {
    if (item.stock === 0) return 'out-of-stock';
    if (item.stock <= item.reorder_level) return 'low-stock';
    return 'in-stock';
  };

  // Filter & Search
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.medicine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.generic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const status = getItemStatus(item);
    if (filterStock === 'low') return matchesSearch && status === 'low-stock';
    if (filterStock === 'out') return matchesSearch && status === 'out-of-stock';
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-brand-dark/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-gold bg-accent-goldLight text-brand-dark text-xs font-black uppercase mb-2">
            <Package className="w-3.5 h-3.5 text-brand-red" />
            Formulary Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-brand-dark">
            Hospital Pharmacy Inventory
          </h1>
          <p className="text-sm text-brand-dark/75 mt-1">
            Real-time PostgreSQL medicine inventory. Used by extraction matching engine to verify SKUs and reserve units.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            className="btn-tactile-white p-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            title="Refresh Inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="btn-tactile-red px-4 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2 shadow-tactile-sm"
          >
            <Plus className="w-4 h-4" />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border-2 border-brand-dark shadow-tactile-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-brand-dark/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by drug name, generic name, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-dark/30 bg-canvas text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-dark/60" />
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="px-3 py-2 rounded-xl border border-brand-dark/30 bg-canvas text-xs font-bold focus:outline-hidden"
          >
            <option value="all">All Items ({items.length})</option>
            <option value="low">
              Low Stock ({items.filter((i) => getItemStatus(i) === 'low-stock').length})
            </option>
            <option value="out">
              Out of Stock ({items.filter((i) => getItemStatus(i) === 'out-of-stock').length})
            </option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-pink mb-3" />
          <p className="font-bold text-sm text-brand-dark">Loading pharmacy formulary from Supabase...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="card-tactile overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-canvas-dark border-b-2 border-brand-dark text-brand-dark font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Medicine &amp; Generic</th>
                  <th className="py-3.5 px-4">Strength / Form</th>
                  <th className="py-3.5 px-4">SKU / Pack</th>
                  <th className="py-3.5 px-4 text-center">Stock Level</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/10">
                {filteredItems.map((item) => {
                  const status = getItemStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-canvas/50 transition-colors">
                      {/* Name */}
                      <td className="py-4 px-4">
                        <div className="font-black text-sm text-brand-dark">{item.medicine}</div>
                        <div className="text-[11px] text-brand-dark/60 font-medium">
                          {item.generic_name || item.medicine}
                        </div>
                      </td>

                      {/* Strength / Form */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-brand-dark">{item.strength}</span>
                        <span className="block text-[11px] text-brand-dark/70 font-semibold">
                          {item.dosage_form}
                        </span>
                      </td>

                      {/* SKU / Pack */}
                      <td className="py-4 px-4 font-mono">
                        <span className="font-bold text-brand-crimson">{item.sku}</span>
                        <span className="block text-[11px] text-brand-dark/60 font-sans font-medium">
                          {item.pack_size}
                        </span>
                      </td>

                      {/* Stock Adjuster */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-canvas p-1 rounded-xl border border-brand-dark/30 shadow-xs">
                          <button
                            onClick={() => handleStockChange(item, -1)}
                            disabled={item.stock <= 0}
                            className="p-1 rounded-lg bg-white border border-brand-dark/30 hover:bg-red-100 disabled:opacity-30 transition-colors"
                            title="Decrease Stock (-1)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-black font-display text-sm w-8 text-center text-brand-dark">
                            {item.stock}
                          </span>
                          <button
                            onClick={() => handleStockChange(item, 1)}
                            className="p-1 rounded-lg bg-white border border-brand-dark/30 hover:bg-emerald-100 transition-colors"
                            title="Increase Stock (+1)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[10px] text-brand-dark/50 mt-1">
                          Reorder at: {item.reorder_level}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg border border-brand-dark/30 bg-white hover:bg-brand-pink hover:text-white transition-colors"
                            title="Edit Medicine"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 rounded-lg border border-brand-dark/30 bg-white hover:bg-brand-red hover:text-white transition-colors"
                            title="Delete Medicine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-brand-dark/60">
                      <AlertTriangle className="w-8 h-8 mx-auto text-accent-gold mb-2" />
                      <p className="font-bold text-sm">No formulary items found matching criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Medicine to Formulary"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                required
                value={formData.medicine}
                onChange={(e) => setFormData({ ...formData, medicine: e.target.value })}
                placeholder="e.g. Amoxicillin"
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Generic Name
              </label>
              <input
                type="text"
                value={formData.generic_name}
                onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                placeholder="e.g. Amoxicillin Trihydrate"
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Strength *
              </label>
              <input
                type="text"
                required
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                placeholder="500 mg"
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Dosage Form *
              </label>
              <select
                value={formData.dosage_form}
                onChange={(e) => setFormData({ ...formData, dosage_form: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-bold"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Ointment">Ointment</option>
                <option value="Inhaler">Inhaler</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Pack Size
              </label>
              <input
                type="text"
                value={formData.pack_size}
                onChange={(e) => setFormData({ ...formData, pack_size: e.target.value })}
                placeholder="100 caps"
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                SKU Identifier
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="AMX-500-CAP"
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Reorder Level
              </label>
              <input
                type="number"
                min="1"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-dark/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn-tactile-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile-red px-5 py-2 rounded-xl text-xs font-black"
            >
              Add to Supabase Formulary
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Medicine Modal */}
      <Modal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={`Edit Medicine: ${formData.medicine}`}
      >
        <form onSubmit={handleEditItem} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                required
                value={formData.medicine}
                onChange={(e) => setFormData({ ...formData, medicine: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Generic Name
              </label>
              <input
                type="text"
                value={formData.generic_name}
                onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Strength *
              </label>
              <input
                type="text"
                required
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Dosage Form *
              </label>
              <select
                value={formData.dosage_form}
                onChange={(e) => setFormData({ ...formData, dosage_form: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-bold"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Ointment">Ointment</option>
                <option value="Inhaler">Inhaler</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Pack Size
              </label>
              <input
                type="text"
                value={formData.pack_size}
                onChange={(e) => setFormData({ ...formData, pack_size: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                SKU Identifier
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-brand-dark mb-1">
                Reorder Level
              </label>
              <input
                type="number"
                min="1"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-brand-dark bg-canvas text-xs font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-dark/10">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="btn-tactile-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile-red px-5 py-2 rounded-xl text-xs font-black"
            >
              Save Changes to Supabase
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title="Confirm Medicine Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-brand-dark">
            Are you sure you want to delete{' '}
            <strong className="text-brand-crimson">{deletingItem?.medicine} ({deletingItem?.strength})</strong> from the formulary? This action will persist in Supabase and cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeletingItem(null)}
              className="btn-tactile-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteItem}
              className="btn-tactile-red px-5 py-2 rounded-xl text-xs font-black bg-brand-crimson"
            >
              Delete from Database
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
