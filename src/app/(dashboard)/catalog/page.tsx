'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ListTree, Plus, X, Package, Trash2 } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function CatalogPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <CatalogContent />
    </ProtectedRoute>
  );
}

function CatalogContent() {
  const [showModal, setShowModal] = useState(false);
  const [editEntryId, setEditEntryId] = useState<string | null>(null);
  const [form, setForm] = useState({ machine_id: '', product_id: '', stock: '', slot_label: '', price_override: '' });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: entries, isLoading } = useQuery({
    queryKey: ['catalog'],
    queryFn: async () => {
      const res = await api.get('/api/admin/catalog');
      return res.data.data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/api/admin/products');
      return res.data.data;
    },
  });

  const { data: machines } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const res = await api.get('/api/admin/machines');
      return res.data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: (data: any) => editEntryId ? api.put(`/api/admin/catalog/${editEntryId}`, data) : api.post('/api/admin/catalog', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Something went wrong');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/catalog/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog'] }),
  });

  const closeModal = () => { setShowModal(false); setError(''); setEditEntryId(null); setForm({ machine_id: '', product_id: '', stock: '', slot_label: '', price_override: '' }); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.machine_id || !form.product_id || !form.stock) { setError('Machine, Product and Stock are required'); return; }
    const stockNum = parseInt(form.stock);
    if (isNaN(stockNum) || stockNum < 0) { setError('Stock must be a valid non-negative integer'); return; }
    const payload: any = { machine_id: form.machine_id, product_id: form.product_id, stock: stockNum };
    if (form.slot_label) payload.slot_label = form.slot_label;
    if (form.price_override) payload.price_override = parseFloat(form.price_override);
    mutation.mutate(payload);
  };

  const getProductName = (product: any) => typeof product === 'object' && product !== null ? product.product_name : (products?.find((p: any) => p._id === product)?.product_name || product);
  const getMachineName = (id: string) => { const m = machines?.find((m: any) => (m.deviceVID === id || m._id === id)); return m ? (m.serialNumber || m.model || id) : id; };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Machine Catalog</h1>
        <button onClick={() => { setError(''); setEditEntryId(null); setForm({ machine_id: '', product_id: '', stock: '', slot_label: '', price_override: '' }); setShowModal(true); }} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Add Catalog Entry
        </button>
      </div>

      <p className="text-sm text-gray-500">Link products to machines to define what each machine dispenses.</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Loading catalog...</div>
        ) : !entries?.length ? (
          <div className="p-12 text-center flex flex-col items-center">
            <ListTree className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No catalog entries yet</h3>
            <p className="text-gray-500 mt-1 text-sm">Click "Add Catalog Entry" to link a product to a machine.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="py-3 px-6 font-medium">Product</th>
                <th className="py-3 px-6 font-medium">Machine</th>
                <th className="py-3 px-6 font-medium">Slot</th>
                <th className="py-3 px-6 font-medium">Stock</th>
                <th className="py-3 px-6 font-medium">Price</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
              {entries?.map((entry: any) => (
                <tr key={entry._id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium">{getProductName(entry.product_id)}</td>
                  <td className="py-4 px-6 font-medium text-gray-900">{getMachineName(entry.machine_id)}</td>
                  <td className="py-4 px-6">{entry.slot_label || '—'}</td>
                  <td className="py-4 px-6">{entry.stock}</td>
                  <td className="py-4 px-6">{entry.price_override ? `₹${entry.price_override}` : 'Default'}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${entry.is_enabled !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {entry.is_enabled !== false ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button onClick={() => { setEditEntryId(entry._id); setForm({ machine_id: entry.machine_id, product_id: entry.product_id, stock: String(entry.stock), slot_label: entry.slot_label || '', price_override: entry.price_override ? String(entry.price_override) : '' }); setError(''); setShowModal(true); }} className="text-blue-500 hover:text-blue-700 mr-3 px-2 py-1 bg-blue-50 rounded-md text-xs font-medium">Refill / Edit</button>
                    <button onClick={() => { if (confirm('Remove this catalog entry?')) deleteMutation.mutate(entry._id); }} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editEntryId ? 'Edit Catalog Entry (Refill Stock)' : 'Add Catalog Entry'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine *</label>
                <select value={form.machine_id} onChange={e => setForm(f => ({ ...f, machine_id: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" required>
                  <option value="">Select a machine...</option>
                  {machines?.map((m: any) => (
                    <option key={m.deviceVID || m._id} value={m.deviceVID || m._id}>{m.serialNumber || m.model || m.deviceVID}</option>
                  ))}
                </select>
                {!machines?.length && <p className="text-xs text-amber-600 mt-1">No machines found. Provision a machine first.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                <select value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" required>
                  <option value="">Select a product...</option>
                  {products?.map((p: any) => (
                    <option key={p._id} value={p._id}>{p.product_name} — ₹{p.price}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="50" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slot Label</label>
                  <input value={form.slot_label} onChange={e => setForm(f => ({ ...f, slot_label: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. A1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Override (₹) <span className="text-gray-400 font-normal">— leave blank to use product default</span></label>
                <input type="number" min="0" step="0.01" value={form.price_override} onChange={e => setForm(f => ({ ...f, price_override: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Optional" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={mutation.isPending} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
                  {mutation.isPending ? (editEntryId ? 'Saving...' : 'Adding...') : (editEntryId ? 'Save Changes' : 'Add to Catalog')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


