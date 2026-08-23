'use client';

import { useAuthStore } from '@/store/authStore';
import { User, Shield, Bell } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/settings/account" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Account</h3>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information and password.</p>
        </Link>
        
        {user?.role === 'SUPER_ADMIN' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer opacity-50 relative group">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Company Details</h3>
            <p className="text-sm text-gray-500 mt-1">Manage company information and billing.</p>
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl font-bold text-gray-700">
              Coming Soon
            </div>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer opacity-50 relative group">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
          <p className="text-sm text-gray-500 mt-1">Configure email and SMS alerts.</p>
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl font-bold text-gray-700">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
}
