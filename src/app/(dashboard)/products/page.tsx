'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Package, Plus, X } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function ProductsPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <ProductsContent />
    </ProtectedRoute>
  );
}

function ProductsContent() {
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({ product_name: '', price: '', category: '', sku: '', image_url: '', description: '', is_available: true });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/api/admin/products');
      return res.data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (editProduct) {
        return api.put(`/api/admin/products/${editProduct._id}`, data);
      }
      return api.post('/api/admin/products', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Something went wrong');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const openAdd = () => {
    setEditProduct(null);
    setForm({ product_name: '', price: '', category: '', sku: '', image_url: '', description: '', is_available: true });
    setError('');
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditProduct(p);
    setForm({ product_name: p.product_name || '', price: String(p.price || ''), category: p.category || '', sku: p.sku || '', image_url: p.image_url || '', description: p.description || '', is_available: p.is_available ?? true });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditProduct(null); setError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_name || !form.price) { setError('Product name and price are required'); return; }
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum < 0) { setError('Price must be a valid positive number'); return; }
    mutation.mutate({ ...form, price: priceNum });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={openAdd} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Loading products...</div>
        ) : products?.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Package className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-1 text-sm">Click "Add Product" to create your first product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-6 font-medium">Product</th>
                  <th className="py-3 px-6 font-medium">Category</th>
                  <th className="py-3 px-6 font-medium">Price</th>
                  <th className="py-3 px-6 font-medium">Available</th>
                  <th className="py-3 px-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                {products?.map((product: any) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 flex items-center space-x-3">
                      {product.image_url ? (
                        <div className="w-10 h-10 rounded-md overflow-hidden relative bg-gray-100 shrink-0">
                          <img src={product.image_url} alt={product.product_name} className="object-cover w-full h-full" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{product.product_name}</div>
                        <div className="text-xs text-gray-500">{product.sku || 'No SKU'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 capitalize">{product.category || '—'}</td>
                    <td className="py-4 px-6 font-medium">₹{product.price}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.is_available !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.is_available !== false ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-4 px-6 space-x-3">
                      <button onClick={() => openEdit(product)} className="text-primary hover:underline font-medium text-sm">Edit</button>
                      <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(product._id); }} className="text-red-500 hover:underline font-medium text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Classic Pani Puri" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="30" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="PP-CLS-01" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Snacks, Beverages" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Short description..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_available" checked={form.is_available} onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))} className="rounded" />
                <label htmlFor="is_available" className="text-sm text-gray-700">Available for sale</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={mutation.isPending} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {mutation.isPending ? 'Saving...' : (editProduct ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
