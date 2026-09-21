'use client';

import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, User as UserIcon, Save } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AccountSettingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';

  // State for company form
  const [companyName, setCompanyName] = useState('');
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');

  // Fetch company details
  const { data: company, isLoading } = useQuery({
    queryKey: ['my-company'],
    queryFn: async () => {
      const res = await api.get('/api/admin/company');
      return res.data.data;
    },
    enabled: isAdmin,
  });

  useEffect(() => {
    if (company) {
      setCompanyName(company.company_name || '');
      setKeyId(company.razorpay_key_id || '');
      setKeySecret(company.razorpay_key_secret || '');
    }
  }, [company]);

  // Mutation to update company
  const updateCompany = useMutation({
    mutationFn: async (updates: any) => {
      const res = await api.put('/api/admin/company', updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-company'] });
      alert('Company settings saved successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to save');
    }
  });

  const handleSaveCompany = () => {
    updateCompany.mutate({
      company_name: companyName,
      razorpay_key_id: keyId,
      razorpay_key_secret: keySecret,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="flex items-center space-x-4">
        <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center space-x-6">
          <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-4xl font-bold">
            <UserIcon className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{((user as any)?.name) || 'User'}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {user?.role.replace('_', ' ').toLowerCase()}
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <h3 className="font-bold text-gray-900 text-lg border-b pb-2">Profile Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" disabled value={user?.email || ''} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company ID</label>
              <input type="text" disabled value={user?.company_id || 'N/A'} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 sm:text-sm" />
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
           <div className="p-8 space-y-6">
              <h3 className="font-bold text-gray-900 text-lg border-b pb-2">Company Profile & Payments</h3>
              <p className="text-sm text-gray-500">Configure your company details and Razorpay API keys to receive payments directly.</p>

              {isLoading ? (
                <div className="text-gray-500 text-sm py-4">Loading...</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Razorpay Key ID</label>
                    <input type="text" value={keyId} onChange={e => setKeyId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm font-mono text-xs" placeholder="rzp_live_..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Razorpay Key Secret</label>
                    <input type="password" value={keySecret} onChange={e => setKeySecret(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary sm:text-sm font-mono text-xs" placeholder="����������������" />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={handleSaveCompany}
                      disabled={updateCompany.isPending}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
                    >
                      {updateCompany.isPending ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Company Details</>}
                    </button>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
}
