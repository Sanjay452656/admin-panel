'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import KPICard from '@/components/dashboard/KPICard';
import { IndianRupee, ShoppingCart, Server, CreditCard, Wrench, Building2, Globe, TrendingUp } from 'lucide-react';
import RevenueChart from '@/components/dashboard/RevenueChart';
import MachineStatusGrid from '@/components/dashboard/MachineStatusGrid';
import RecentOrders from '@/components/dashboard/RecentOrders';
import AlertBanner from '@/components/alerts/AlertBanner';
import AlertToast from '@/components/alerts/AlertToast';
import AlertSound from '@/components/alerts/AlertSound';
import Link from 'next/link';
import TechnicianDashboard from '@/components/dashboard/TechnicianDashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isTechnician  = user?.role === 'TECHNICIAN';
  const isSuperAdmin  = user?.role === 'SUPER_ADMIN';

  // Analytics summary — SUPER_ADMIN gets global (no tenant filter), ADMIN gets scoped
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/summary');
      return res.data.data;
    },
    enabled: !isTechnician,
  });

  // Platform-level: revenue per company (SUPER_ADMIN only)
  const { data: revenueByCompany, isLoading: loadingCompanyRevenue } = useQuery({
    queryKey: ['analytics', 'revenue-by-company'],
    queryFn: async () => {
      const res = await api.get('/api/admin/analytics/revenue-by-company');
      return res.data.data as any[];
    },
    enabled: isSuperAdmin,
  });

  // Company count (SUPER_ADMIN only)
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await api.get('/api/admin/companies');
      return res.data.data as any[];
    },
    enabled: isSuperAdmin,
  });

  const companyChartData = (revenueByCompany || []).map((r: any) => ({
    name:    r.company_name,
    revenue: r.total_revenue,
    orders:  r.total_orders,
  }));

  // ---------- TECHNICIAN VIEW ----------
  if (isTechnician) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            <Wrench className="w-4 h-4" />
            Technician View
          </div>
        </div>
        <AlertSound /><AlertBanner /><AlertToast />
        <TechnicianDashboard />
      </div>
    );
  }

  // ---------- ADMIN / SUPER_ADMIN VIEW ----------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isSuperAdmin ? 'Global platform overview across all tenants' : 'Company analytics overview'}
          </p>
        </div>
        <div className={'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ' +
          (isSuperAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700')}>
          {isSuperAdmin ? <Globe className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
          {isSuperAdmin ? 'Platform Admin' : 'Admin View'}
        </div>
      </div>

      <AlertSound /><AlertBanner /><AlertToast />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title={isSuperAdmin ? 'Platform Revenue' : 'Total Revenue'}
          value={loadingSummary ? '...' : (summary?.total_revenue ?? 0)}
          prefix="Rs."
          icon={<IndianRupee className="w-5 h-5" />}
          color="indigo"
        />
        <KPICard
          title={isSuperAdmin ? 'Platform Orders' : 'Total Orders'}
          value={loadingSummary ? '...' : (summary?.total_orders ?? 0)}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="green"
          subtitle={'Paid: ' + (summary?.paid_orders ?? 0)}
        />
        {isSuperAdmin ? (
          <KPICard
            title="Total Companies"
            value={companies ? companies.length : '...'}
            icon={<Building2 className="w-5 h-5" />}
            color="amber"
          />
        ) : (
          <KPICard
            title="Paid Orders"
            value={loadingSummary ? '...' : (summary?.paid_orders ?? 0)}
            icon={<CreditCard className="w-5 h-5" />}
            color="amber"
          />
        )}
        <KPICard
          title="Avg Order Value"
          value={loadingSummary ? '...' : Number(summary?.avg_order_value ?? 0).toFixed(2)}
          prefix="Rs."
          icon={<Server className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Revenue Chart + Machine + Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart />
          <RecentOrders />
        </div>
        <div>
          <MachineStatusGrid />
        </div>
      </div>
    </div>
  );
}



