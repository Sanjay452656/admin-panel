'use client';

import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function AccountSettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
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
            <h2 className="text-xl font-bold text-gray-900">Admin User</h2>
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
              <input type="text" disabled value={user?.company_id || ''} className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 sm:text-sm" />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
             <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed">
               Save Changes
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
