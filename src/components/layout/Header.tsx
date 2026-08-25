'use client';

import { Bell, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useAlertStore } from '@/store/alertStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useAlertStore();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: companyData } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get('/api/admin/auth/me');
      return res.data.data;
    },
    enabled: !!user,
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const displayTitle = isSuperAdmin
    ? 'M9Vends Platform'
    : companyData?.company_name || user?.email?.split('@')[1] || 'Loading...';

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-base font-semibold text-gray-900 leading-tight">{displayTitle}</div>
          {!isSuperAdmin && companyData?.plan && (
            <div className="text-xs text-gray-400">{companyData.plan} Plan</div>
          )}
          {isSuperAdmin && (
            <div className="flex items-center gap-1 text-xs text-indigo-500 font-medium">
              <Shield className="w-3 h-3" />
              Super Admin
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className={'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ' + (isSuperAdmin ? 'bg-indigo-600' : 'bg-primary')}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium text-gray-900 leading-tight">{user?.email?.split('@')[0]}</div>
              <div className="text-xs text-gray-400">{user?.role?.replace(/_/g, ' ')}</div>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-1 border border-gray-100 z-50">
              <div className="px-4 py-2.5 border-b border-gray-50">
                <div className="text-sm font-medium text-gray-900">{user?.email}</div>
                <div className="text-xs text-gray-400 mt-0.5">{user?.role?.replace(/_/g, ' ')}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2 text-gray-400" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
