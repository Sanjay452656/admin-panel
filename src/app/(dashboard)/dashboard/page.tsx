'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import KPICard from '@/components/dashboard/KPICard';
import { IndianRupee, ShoppingCart, Server, CreditCard, Wrench } from 'lucide-react';
import RevenueChart from '@/components/dashboard/RevenueChart';
import MachineStatusGrid from '@/components/dashboard/MachineStatusGrid';
import RecentOrders from '@/components/dashboard/RecentOrders';
import AlertBanner from '@/components/alerts/AlertBanner';
import AlertToast from '@/components/alerts/AlertToast';
import AlertSound from '@/components/alerts/AlertSound';
import TechnicianDashboard from '@/components/dashboard/TechnicianDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isTechnician = user?.role === 'TECHNICIAN';

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/summary');
      return res.data.data;
    },
    enabled: !isTechnician,
  });

  if (isTechnician) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            <Wrench className="w-4 h-4 mr-1.5" />
            Technician View
          </div>
        </div>
        <AlertSound />
        <AlertBanner />
        <AlertToast />
        <TechnicianDashboard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
          {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} View
        </div>
      </div>

      <AlertSound />
      <AlertBanner />
      <AlertToast />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={loadingSummary ? "..." : (summary?.total_revenue || 0)}
          icon={<IndianRupee className="w-6 h-6" />}
        />
        <KPICard
          title="Total Orders"
          value={loadingSummary ? "..." : (summary?.total_orders || 0)}
          icon={<ShoppingCart className="w-6 h-6" />}
        />
        <KPICard
          title="Paid Orders"
          value={loadingSummary ? "..." : (summary?.paid_orders || 0)}
          icon={<CreditCard className="w-6 h-6" />}
        />
        <KPICard
          title="Avg Order Value"
          value={loadingSummary ? "..." : (summary?.avg_order_value?.toFixed(2) || 0)}
          icon={<Server className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart />
          <RecentOrders />
        </div>
        <div className="space-y-6">
          <MachineStatusGrid />
        </div>
      </div>
    </div>
  );
}
