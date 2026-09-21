'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function CreateCompanyPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <CreateCompanyContent />
    </ProtectedRoute>
  );
}

function CreateCompanyContent() {
  const [companyName, setCompanyName] = useState('');
  const [plan, setPlan] = useState('FREE');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/api/admin/companies', {
        company_name: companyName,
        plan,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      });
      if (res.data.success) {
        router.push('/companies');
      } else {
        setError(res.data.message || 'Failed to create company');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/companies" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Company</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Company Details</h2>
            <p className="text-sm text-gray-500">Create a new tenant on the platform.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100 border border-red-200 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="companyName">
                Company Name *
              </label>
              <input
                id="companyName"
                type="text"
                required
                placeholder="e.g. SnackVend Co."
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="contactEmail">
                  Contact Email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  placeholder="admin@snackvend.com"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="contactPhone">
                  Contact Phone
                </label>
                <input
                  id="contactPhone"
                  type="text"
                  placeholder="+1 555-0123"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="plan">
                Subscription Plan
              </label>
              <select
                id="plan"
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              >
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
             <button
              type="submit"
              disabled={loading || !companyName}
              className="px-6 py-2 text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
